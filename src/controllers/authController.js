import jwt from 'jsonwebtoken';
import db from "../models/index";
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

const authController = {

    // REGISTER USER
    registerUser: async (req, res) => {
        try {
            let username = await db.User.findOne({
                raw: true,
                where: {
                    userName: req.body.userName
                }
              });

              // CHECK USERNAME EXISTS
              if(username) {
                res.status(200).json('username đã tồn tại')
              } else {
                let email = await db.User.findOne({
                    raw: true,
                    where: {
                        email: req.body.email
                    }
                  });

                  // CHECK EMAIL EXISTS
                  if(email) {
                    res.status(200).json('email đã tồn tại')
                  } else {
                    let phone = await db.User.findOne({
                        raw: true,
                        where: {
                            phone: req.body.phone
                        }
                      });

                      // CHECK PHONE EXISTS
                     if(phone) {
                        res.status(200).json('số điện thoại đã tồn tại')
                     } else {
                        let hash = bcrypt.hashSync(req.body.password, salt);
                        // INSERT DATA TO DB
                        let data = await db.User.create({ 
                            userName: req.body.userName,
                            email: req.body.email,
                            phone: req.body.phone,
                            password: hash
                          })
                          res.status(200).json('đăng ký thành công')
                     }
                  }
              }

        } catch(err) {
            res.status(500).json('loi server');
        }
    },

    // LOGIN USER
    loginUser: async (req, res) => {
        try {
            let user = await db.User.findOne({
                raw: true,
                where: {
                    userName: req.body.userName
                }
            })
            if(!user) {
                res.status(403).json('Tên đăng nhập không tồn tại')
            } else {
                let validatePassword = bcrypt.compareSync(req.body.password, user.password)
                if(!validatePassword) {
                    res.status(403).json('Sai mật khẩu')
                } else {
                    // đẩy accToken về client, client chuyển accTk vào header cảu http để server xác thực
                    // đẩy refresh token vào cookies và DB 
                   let accessToken = jwt.sign({
                        id: user.id,
                        username: user.userName
                    }, process.env.ACCESS_TOKEN_KEY, {
                        expiresIn: 60
                    })
                    let refreshToken = jwt.sign({
                        id: user.id,
                        username: user.userName
                    }, process.env.REFRESH_TOKEN_KEY, {
                        expiresIn: 120
                    })
                   let insert = await db.LoginToken.create({
                        userId: user.id,
                        token: refreshToken
                    })
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: true,
                        secure: false,
                    })
                    res.status(200).json({
                        ...user,
                        refreshToken
                    })
                }
            }
        } catch(err) {
            res.status(500).json('loi server');
        }
    },

    // USER LOGOUT
    logoutUser: async (req, res) => {
        await db.LoginToken.destroy({
            where: {
                token: req.cookies.refreshToken
            }
        })
        res.clearCookie('refreshToken');
        res.status(200).json('dang xuat thanh cong')
    },

    // CREATE NEW ACCESS TOKEN TO MAINTAIN STATE LOGED IN
    requestRefreshToken: async (req, res) => {
        let refToken = req.cookies.refreshToken
        if(!refToken) {
            return res.status(403).json('you have not loged in yet')
        }
        let refTokenDB = await db.LoginToken.findOne({
            where: {
                token: refToken
            }
        })
        if(!refTokenDB) return res.status('403').json('not valid')
        await jwt.verify(refToken, process.env.REFRESH_TOKEN_KEY, (err, user) => {
            if(err) return res.status(403).json(err)
            let accessToken = jwt.sign({id: user.id, username: user.userNaem}, process.env.ACCESS_TOKEN_KEY,
                {
                    expiresIn: 60
                })
        })
    }
}

module.exports = authController;