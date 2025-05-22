import bcrypt from 'bcrypt'
import 'dotenv/config'
import { v4 as uuidv4 } from 'uuid'
import { UserDto } from '../dto/userDro'
import userModel from '../api/models/usersModel'
import mailService from './mailService.ts'
import tokenService from './tokenService.ts'



class MembersService {
    async registration(email: any, password: any, name: any,) {
        const candidate = await userModel.findOne({ email })
        if (candidate) {
            throw Error('Пользователь с таким email уже существует')
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationCode = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
        const today = new Date();

        const day = today.getDate();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();

        const formattedDate = `${day.toString().padStart(2, '0')}.${month
            .toString()
            .padStart(2, '0')}.${year}`;
        const user = await userModel.create({
            email,
            password: hashPassword,
            name,
            code: activationCode,
            date: formattedDate,
        })
        // console.log(email,password,hashPassword,name)
        await mailService.sendActivationMail(
            email,
            activationCode
        )

        const userDto = new UserDto({
            id: user._id.toString(),
            email: user.email,
            password: hashPassword,
            name: user.name,
            _id: user._id,
            isActivated: false
        })
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return { ...tokens, user: userDto, text: "Вы успешно зарегистрировались" }
    }

    async activate(activationLink: any) {
        const user = await userModel.findOne({ activationLink } as any)

        if (!user) throw Error('Пользователь с таким email не найден')
        user.set('isActivated', true)
        await user.save()
    }

    async login(email: any, password: any) {

        const user = await userModel.findOne({ email })
        if (!user) throw Error('Пользователь с таким email не найден')

        if (!user.password) {
            throw new Error('Пароль не найден для данного пользователя')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) throw Error('Пароль неверный')

        const userDto = new UserDto({
            id: user._id.toString(),
            email: user.email,
            password: user.password,
            name: user.name,
            _id: user._id,
            isActivated: false
        })
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return { ...tokens, user: userDto, text: 'Вы успешно авторизовались' }
    }

    async logout(refreshToken: any) {
        const token = await tokenService.removeToken(refreshToken)
        return token
    }
    async refresh(refreshToken: any) {
        if (!refreshToken) {
            throw Error('Пользователь не авторизован')
        }

        const userData = await tokenService.validateRefreshToken(refreshToken)
        const tokenFromDB = await tokenService.findToken(refreshToken)

        if (!userData || typeof userData === 'string') {
            throw Error('Пользователь не авторизован')
        }

        const user = await userModel.findById(userData.id)
        if (!user) {
            throw Error('Пользователь не авторизован')
        }

        const userDto = new UserDto({
            id: user._id.toString(),
            email: user.email,
            password: user.password,
            name: user.name,
            _id: user._id,
            isActivated: false
        })
        const tokens = tokenService.generateTokens({ ...userDto })
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return { ...tokens, user: userDto }
    }
    async checkAuth(refreshToken: any) {
        // console.log(refreshToken)
        if (!refreshToken) throw Error('Пользователь не авторизован')

        const userData = await tokenService.validateRefreshToken(refreshToken)
        if (!userData || typeof userData === 'string') throw Error('Пользователь не авторизован')

        const user = await userModel.findOne({ email: userData.email })

        if (!user) throw Error('Пользователь не авторизован')

        const userDto = new UserDto({
            id: user._id.toString(),
            email: user.email,
            password: user.password,
            name: user.name,
            _id: user._id,
            isActivated: false
        })
        return { user: userDto }
    }

}
export default new MembersService()