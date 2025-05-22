import 'dotenv/config'
import nodemailer from 'nodemailer'
class mailService {
    transporter: any
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        })
    }

    async sendActivationMail(email: any, code: number) {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: `Активация аккаунта в приложении SeeU`,
                text: '',

                html: `
                    <div style="background: #439CBF; padding: 20px; border-radius: 10px; font-family: Arial, sans-serif;">
                        <h1 style="color: rgb(255, 255, 255);">Благодарим вас за то, что вы зарегистрировались в нашем приложении!</h1>
                        <p style="color: white; font-size: 20px;">Для завершения процесса регистрации, пожалуйста, введите в приложении следующий код активации:</p>
                        <h2 style="font-size: 30px; font-weight: bold; color: rgb(255, 255, 255);">${code}</h2>
                    </div>    
				`

            })
        } catch (err) {
            console.error('Error sending email:', err)
            throw err
        }
    }
}

export default new mailService()
