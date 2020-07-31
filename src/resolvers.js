const bcrypt = require('bcryptjs');

const User = require('./models/User');
const { authenticateFacebook, authenticateGoogle } = require('./passport');
const { transport, makeANiceEmail } = require('./mail');

const resolvers = {
  Query: {
    users: (_, args, context) => {
      if (!context.user) {
        throw new Error('Necesitas iniciar sesión');
      }
      if (context.user.role !== 'ADMIN') {
        throw new Error('No tienes permisos');
      }
      return User.find();
    },
    me: (_, args, context) => {
      if (!context.user) {
        throw new Error('Necesitas iniciar sesión');
      }

      return User.findOne({ email: context.user.email });
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('El usuario no existe');
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        throw new Error('La contraseña no es correcta');
      }
      return {
        userId: user.id,
        token: user.generateJWT(user),
        tokenExpiration: 30,
      };
    },
  },
  Mutation: {
    createUser: (_, { email, password, firstName, lastName }) => {
      return User.findOne({ email })
        .then((user) => {
          if (user) {
            throw new Error('¡El usuario ya existe!');
          }
          return bcrypt.hash(password, 12);
        })
        .then((hashedPashowrd) => {
          const user = new User({
            email,
            password: hashedPashowrd,
            firstName,
            lastName,
          });
          return user.save();
        })
        .then(async (result) => {
          const newUser = await User.findOne({ _id: result.id });
          return {
            userId: result.id,
            token: newUser.generateJWT(newUser),
            tokenExpiration: 30,
          };
        })
        .catch((err) => {
          throw err;
        });
    },
    authFacebook: async (_, { accessToken }, { req, res }) => {
      req.body = {
        ...req.body,
        access_token: accessToken,
      };
      try {
        const { data, info } = await authenticateFacebook(req, res);
        if (data) {
          const user = await User.upsertFbUser(data);
          if (user) {
            return {
              userId: user._id,
              token: user.generateJWT(user),
              tokenExpiration: 30,
            };
          }
        }

        if (info) {
          console.log(info);
          switch (info.code) {
            case 'ETIMEDOUT':
              return new Error('Failed to reach Facebook: Try Again');
            default:
              return new Error('something went wrong');
          }
        }
        return Error('server error');
      } catch (error) {
        return error;
      }
    },
    authGoogle: async (_, { accessToken }, { req, res }) => {
      req.body = {
        ...req.body,
        access_token: accessToken,
      };

      try {
        // data contains the accessToken, refreshToken and profile from passport
        const { data, info } = await authenticateGoogle(req, res);

        if (data) {
          const user = await User.upsertGoogleUser(data);

          if (user) {
            return {
              name: user.name,
              token: user.generateJWT(user),
            };
          }
        }

        if (info) {
          console.log(info);
          switch (info.code) {
            case 'ETIMEDOUT':
              return new Error('Failed to reach Google: Try Again');
            default:
              return new Error('something went wrong');
          }
        }
        return Error('server error');
      } catch (error) {
        return error;
      }
    },
    updateMe: async (_, args, { user }) => {
      if (!user) {
        throw new Error('Necesitas iniciar sesión');
      }

      const newArgs = JSON.parse(JSON.stringify(args));

      try {
        const result = await User.findOneAndUpdate(
          { _id: user.userId },
          newArgs.userInput
        );
        if (!result) {
          return false;
        }
        return true;
      } catch (err) {
        throw new Error('error');
      }
    },
    requestReset: async (_, { email }) => {
      const user = await User.findOne({ email });
      if (!user) {
        throw new Error('El email no está registrado');
      }
      const resetToken = user.generateJWT(user);
      const resetTokenExpiry = Date.now() + 3600000;

      const result = await User.findOneAndUpdate(
        { _id: user._id },
        { resetToken: resetToken, resetTokenExpiry: resetTokenExpiry }
      );
      if (!result) {
        throw new Error('No se pudo actualizar la db');
      }
      const mailRes = await transport.sendMail({
        from: 'gabriel.rojas@dbravos.com',
        to: user.email,
        subject: 'Your Password Reset Token',
        html: makeANiceEmail(
          `¡Puedes cambiar tu contraseñan con un click! 
          \n\n 
          <a href="${process.env.FRONTEND_URL}reset?resetToken=${resetToken}">
            Click aquí para resetear
          </a>
          `
        ),
      });
      console.log(process.env.FRONTEND_URL);
      console.log(mailRes);
    },
  },
};

module.exports = { resolvers };
