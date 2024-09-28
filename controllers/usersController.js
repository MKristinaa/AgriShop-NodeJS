const User = require('../models/user')
const sendToken = require('../utils/jwtToken')
const sendEmail = require('../utils/sendEmail')
const cloudinary = require('cloudinary')

const crypto = require('crypto')

//register user
exports.registerUser = async (req, res, next) => {
    try {
        const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: 'avatars',
            width: 150,
            crop: 'scale'
        });

        const { name, lastname, email, password, role } = req.body;

        const user = await User.create({
            name,
            lastname,
            email,
            password,
            role,
            avatar: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });

        const verificationToken = user.getVerificationToken();

        await user.save({ validateBeforeSave: false });

        const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;

        const message = `Hello ${name},\n\nPlease verify your email by clicking the following link: \n\n${verificationUrl}\n\nIf you did not request this, please ignore it.`;

        await sendEmail({
            email: user.email,
            subject: 'Email Verification',
            message
        });

        res.status(200).json({
            success: true,
            message: `Verification email sent to: ${user.email}`
        });
    } catch (error) {
        return next(error);
    }
};


exports.verifyEmail = async (req, res, next) => {
    const emailVerificationToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        emailVerificationToken,
        isVerified: false
    });

    if (!user) {
        const htmlResponse = `
            <html>
                <head>
                    <title>Verification Failed</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f9;
                            text-align: center;
                            padding: 50px;
                        }
                        .container {
                            background-color: #fff;
                            padding: 20px;
                            border-radius: 8px;
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            max-width: 500px;
                            margin: auto;
                        }
                        h1 {
                            color: #f44336;
                        }
                        p {
                            color: #555;
                        }
                        a {
                            color: #4CAF50;
                            text-decoration: none;
                            font-weight: bold;
                        }
                        a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Verification Failed</h1>
                        <p>The verification token is invalid or has expired.</p>
                    </div>
                </body>
            </html>
        `;

        return res.status(400).send(htmlResponse);
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;

    await user.save({ validateBeforeSave: false });

    const htmlResponse = `
        <html>
            <head>
                <title>Email Verified</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f4f4f9;
                        text-align: center;
                        padding: 50px;
                    }
                    .container {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                        max-width: 500px;
                        margin: auto;
                    }
                    h1 {
                        color: #4CAF50;
                    }
                    p {
                        color: #555;
                    }
                    a {
                        color: #4CAF50;
                        text-decoration: none;
                        font-weight: bold;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Email Verified Successfully!</h1>
                    <p>Your email has been verified. You can now <a href="http://localhost:3000/login">login to your account</a>.</p>
                </div>
            </body>
        </html>
    `;

    res.status(200).send(htmlResponse);
};





// Login user
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please enter your email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(400).json({ message: 'Email or password is not valid' });
    }

    if (!user.isVerified) {
        return res.status(400).json({ message: 'Your account is not verified. Please verify your email before logging in.' });
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return res.status(400).json({ message: 'Email or password is not valid' });
    }

    sendToken(user, 200, res);
};


//Forgot password => /api/passwprd/forgot
exports.forgotPassword = async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next('User not found with this email');
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false })

    const resetUrl = `${req.protocol}://${req.get('host')}/api/password/reset/${resetToken}`;

    const message = `Your password reset token is as follow: \n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`

    try {
        
        await sendEmail({
            email: user.email,
            subject: 'AgriShop Password Recovery',
            message
        })

        res.status(200).json({
            success:true,
            message:`Email send to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false })

        return next(error.message)
    }
}



//Reset password => /api/passwprd/reset/:token
exports.resetPassword = async (req, res, next) => {

    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if(!user){
        return next('Password reset token is ivalid or has been expired')
    }

    if(req.body.password !== req.body.confirmPassword){
        return next('Password does not match')
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendToken(user, 200, res);
}


//Get currently logged in user details
exports.getUserProfile = async (req, res, next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({
        success: true,
        user
    })
}

// Update password => /api/password/update
exports.updatePassword = async (req, res, next) => {
    try {
        if (!req.body.password) {
            return res.status(400).json({ success: false, message: 'Please enter new password.' });
        }

        const user = await User.findById(req.body.id).select('+password');

        const isMatched = await user.comparePassword(req.body.oldPassword);
        if (!isMatched) {
            return res.status(400).json({ success: false, message: 'Old password is incorrect.' });
        }

        user.password = req.body.password;
        await user.save();

        sendToken(user, 200, res);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};






// Update user profile   =>   /api/v1/me/update
exports.updateProfile = async (req, res, next) => {
    try {
        const newUserData = {
            name: req.body.name,
            lastname: req.body.lastname,
            email: req.body.email,
            user: req.body.user
        };

        if (req.body.avatar !== '') {
            const user = await User.findById(req.body.user);


        console.log("Updating user profile for user ID:", req.body.user);

            const image_id = user.avatar.public_id;
            await cloudinary.v2.uploader.destroy(image_id);

            const result = await cloudinary.v2.uploader.upload(req.body.avatar, {
                folder: 'avatars',
                width: 150,
                crop: "scale"
            });

            newUserData.avatar = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const user = await User.findByIdAndUpdate(req.body.user, newUserData, {
            new: true,
            runValidators: true,
            useFindAndModify: false
        });

        res.status(200).json({
            success: true,
            user
        });

    } catch (error) {
        return next(error); 
    }
};


//Logout user  => /api/logout 
exports.logout = async(req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true, 
        message: 'Logged out'
    })
}


//Get All Users => /api/users
exports.allUsers = async(req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
}

//Get User Details
exports.getUserDetails = async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user){
        return next(`User does not found with id: ${req.param.id}`);
    }

    res.status(200).json({
        success: true,
        user
    })
}

// User profile update => /api/admin/user/:id
exports.updateUser = async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        lastname: req.body.lastname,
        email: req.body.email,
        role: req.body.role
    };

    let user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
    }

    user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true, 
        runValidators: true,
        useFindAndModify: false 
    });

    res.status(200).json({
        success: true,
        user 
    });
}

//Delete User=> /api/delete 
exports.deleteUser = async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user) {
        return res.status(404).json({
            success: false, 
            message: 'User does not found'
        })
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true, 
        message: 'User is deleted'
    })
}
