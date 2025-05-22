import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { TokenModel } from '../api/models/tokenModel'
class tokenService {
    findToken(refreshToken: any) {
        throw new Error('Method not implemented.')
    }
    generateTokens(payload: any) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN || '', {
            expiresIn: '15m'
        })
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_TOKEN || '', {
            expiresIn: '30d'
        })

        return { accessToken, refreshToken }
    }
    async validateAccessToken(token: any) {
        try {
            if (process.env.JWT_ACCESS_TOKEN) {
                const userData = jwt.verify(token, process.env.JWT_ACCESS_TOKEN)
                return userData
            }
            return null
        } catch (err) {
            return null
        }
    }
    async validateRefreshToken(token: any) {
        try {
            if (process.env.JWT_REFRESH_TOKEN) {
                const userData = jwt.verify(token, process.env.JWT_REFRESH_TOKEN)
                return userData
            }
            return null
        } catch (err) {
            return null
        }
    }
    async saveToken(userId: any, refreshToken: string | null | undefined) {
        const tokenData = await TokenModel.findOne({ user: userId })
        if (tokenData) {
            tokenData.refreshToken = refreshToken
            return tokenData.save()
        }

        const token = await TokenModel.create({ user: userId, refreshToken })
        return token
    }

    async removeToken(refreshToken: any) {
        const tokenData = await TokenModel.deleteOne({ refreshToken })
        return tokenData
    }
}

export default new tokenService()
