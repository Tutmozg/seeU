import { json } from 'express'
import userModel from '../api/models/usersModel'
import membersService from '../services/membersService'
import groupModel from '../api/models/groupModel'
import { time } from 'console'



class MembersController {

    static async addUser(req: any, res: any) {
        try {
            const { email, name, password } = req.body
            const newUser = {
                email,
                name,
                password,
            }
            const member = new userModel(newUser)
            await member.save()
            res.json(member)
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async registration(req: any, res: {
        cookie: (arg0: string, arg1: any, arg2: {
            maxAge: number //30 дней
            httpOnly: boolean
        }) => void; json: (arg0: { user: any; accessToken: any; refreshToken: any }) => any
    }, next: (arg0: unknown) => void) {

        try {
            const { email, name, password } = req.body
            const userData = await membersService.registration(
                email,
                password,
                name,
            )
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000, //30 дней
                httpOnly: true
            })
            return res.json(userData)
        } catch (err) {
            //deleteFileOnError(req, res, next)
            next(err)
        }
    }
    static async login(req: any, res: any, next: (arg0: unknown) => void) {
        try {
            const { email, password } = req.body
            const userData = await membersService.login(email, password)
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000, //30 дней
                httpOnly: true
            })
            return res.json(userData)
        } catch (err) {
            next(err)
        }
    }
    static async getUsers(req: any, res: any) {
        try {
            const users = await userModel.find()
            res.json(users)
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async activate(req: { params: { link: string } }, res: any, next: (arg0: unknown) => void) {
        const activationLink = req.params.link
        try {
            await membersService.activate(activationLink)
            return res.json('Вы успешно зарегестрировались!!!')
        } catch (err) {
            next(err)
        }
    }

    static async refresh(req: { cookies: { refreshToken: any } }, res: {
        cookie: (arg0: string, arg1: any, arg2: {
            maxAge: number //30 дней
            httpOnly: boolean
        }) => void; json: (arg0: { user: any; accessToken: any; refreshToken: any }) => any
    }, next: (arg0: unknown) => void) {
        try {
            const { refreshToken } = req.cookies
            const userData = await membersService.refresh(refreshToken)
            res.cookie('refreshToken', userData.refreshToken, {
                maxAge: 30 * 24 * 60 * 60 * 1000, //30 дней
                httpOnly: true
            })
            return res.json(userData)
        } catch (err) {
            next(err)
        }
    }

    static async checkAuth(req: any, res: { json: (arg0: { user: any }) => any }, next: (arg0: unknown) => void) {
        try {
            const refreshToken = req.query.token
            const userData = await membersService.checkAuth(refreshToken)
            return res.json(userData)
        } catch (err) {
            next(err)
        }
    }
    static async addImg(req: any, res: any) {
        try {
            const { email, uri } = req.body
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            user.img = uri
            await user.save()
            res.json(user.img)
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async getImg(req: any, res: any) {
        try {
            const { email } = req.params
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.json(user.img)
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async addLocation(req: any, res: any) {
        try {
            const { email, latitude, longitude } = req.body
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            user.latitude = latitude
            user.longitude = longitude
            await user.save()
            res.json(user)
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async getLocation(req: any, res: any) {
        try {
            const { email } = req.params
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.json({ latitude: user.latitude, longitude: user.longitude })
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async addFriend(req: any, res: any) {
        try {
            const { email, friendEmail } = req.body
            const user = await userModel.findOne({ email })
            const friend = await userModel.findOne({ email: friendEmail })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            if (!friend) {
                return res.status(404).json({ error: 'Friend not found' })
            }
            user.friends.push(friendEmail)
            friend.friends.push(email)
            await user.save()
            await friend.save()
            res.json(friend)
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async autheticate(req: any, res: any) {
        try {
            const { email, code } = req.body
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            if (user.code !== code) {
                return res.status(401).json({ error: 'Invalid code' })
            }
            else if (user.code === code) {
                user.code = 0
                user.isActivated = true
                await user.save()
                return res.json({ message: 'Code is valid' })
            }
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async addGroup(req: any, res: any) {
        try {
            const { email, groupName, groupType, groupTime } = req.body
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            const code = Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
            const today = new Date();

            const day = today.getDate();
            const month = today.getMonth() + 1;
            const year = today.getFullYear();

            const formattedDate = `${day.toString().padStart(2, '0')}.${month
                .toString()
                .padStart(2, '0')}.${year}`;
            const group = await groupModel.create({
                name: groupName,
                type: groupType,
                time: groupTime,
                date: formattedDate,
                emailCreator: email,
                code: code,
            })
            user.groups.push(group._id)
            await user.save()
            return res.json({ code: group.code, message: "Группа была успешно добавлена" })
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async addGroupMember(req: any, res: any) {
        try {
            const { memberId, code } = req.body
            const group = await groupModel.findOne({ code })
            if (!group) {
                return res.status(404).json({ error: 'Group not found' })
            }
            const user = await userModel.findOne({ memberId })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            user.groups.push(group._id)
            group.members.push(user._id)
            await user.save()
            await group.save()
            return res.json({ message: 'User added to group' })
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async getFriends(req: any, res: any) {
        try {
            const { email } = req.params

            const user = await userModel.findOne({ email })
            console.log(user)
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }

            const friendsPromises = user.friends.map(async (friendEmail: string) => {
                const friend = await userModel.findOne({ email: friendEmail })
                if (!friend) {
                    throw new Error('Friend not found') // Обработаем ошибку позже
                }
                console.log(friend._id)
                return {
                    latitude: friend.latitude,
                    longitude: friend.longitude,
                    img: friend.img,
                    email: friend.email,
                    id: friend._id
                }
            })

            // Ждём выполнения всех промисов
            const friends = await Promise.all(friendsPromises)
            res.json(friends)
        } catch (err) {
            console.error('❌ Error while getting friends:', err)
            res.status(500).json({ error: 'Internal Server Error' })
        }
    }
    static async getGroups(req: any, res: any) {
        try {
            const { email } = req.params
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            const groupsArr = user.groups.map(async (group: any) => {
                const groupData = await groupModel.findById(group)
                return groupData
            })
            const groups = await Promise.all(groupsArr)
            res.json(groups)
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async getUser(req: any, res: any) {
        try {
            const { email } = req.params
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.json(
                {
                    email: user.email,
                    name: user.name,
                    password: '1111',
                    img: user.img,
                    friends: user.friends.length,
                    date: user.date,
                }
            )
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async getFriend(req: any, res: any) {
        try {
            const { email } = req.params
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            res.json(
                {
                    email: user.email,
                    name: user.name,
                    groups: user.groups.length,
                    img: user.img,
                    friends: user.friends.length,
                    date: user.date,
                }
            )
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async changeImg(req: any, res: any) {
        try {
            const { email, img } = req.body

            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }

            user.img = img
            console.log(user.img)
            await user.save()
            res.json({ message: 'Image changed successfully' })
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async comeInGroup(req: any, res: any) {
        try {
            const { email, groupCode } = req.body
            const user = await userModel.findOne({ email })
            if (!user) {
                return res.status(404).json({ error: 'User not found' })
            }
            const group = await groupModel.findOne({ code: groupCode })
            if (!group) {
                return res.status(404).json({ error: 'Group not found' })
            }
            if (group.members.includes(user._id)) {
                return res.status(400).json({ error: 'User already in group' })
            }
            group.members.push(user._id)
            await group.save()
            user.groups.push(group._id)
            res.json({
                message: 'User added to group successfully',
                name: group.name,
                _id: group._id,
                type: group.type,
                time: group.time,
            })
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async findFriends(req: any, res: any) {
        try {
            const { name } = req.body
            if (name !== '') {
                const users = await userModel.find({})
                const emails = users.filter(user => user.email?.toLowerCase().startsWith(name.toLowerCase())).map(user => user.email);
                res.json({ friends: emails, message: 'Friends found successfully' })
            }

            else {
                console.log('name is empty')
            }
        } catch (err) {
            console.error('error while getting breeds', err)
        }
    }
    static async deleteGroups(req: any, res: any) {
        try {
            const { email } = req.params;
            const user = await userModel.findOne({ email });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            for (const groupID of user.groups) {
                const groupUsers = await groupModel.findOne({ _id: groupID });

                if (!groupUsers) {
                    console.warn(`Group ${groupID} not found`);
                    continue;
                }
                if (!groupUsers.time) {
                    console.warn(`Group ${groupID} has no time field`);
                    continue;
                }
                const deleteAfterDays = +groupUsers.time;

                function addDays(date: Date, days: number): Date {
                    const result = new Date(date);
                    result.setDate(result.getDate() + days);
                    return result;
                }

                function parseDate(str: string): Date {
                    const [day, month, year] = str.split(".");
                    return new Date(`${year}-${month}-${day}`);
                }

                const createdAtStr = groupUsers.date;
                if (!createdAtStr) {
                    console.warn(`Group ${groupID} has no createdAt field`);
                    continue;
                }

                const createdDate = parseDate(createdAtStr);
                const deleteDate = addDays(createdDate, deleteAfterDays);
                const now = new Date();

                if (now >= deleteDate) {
                    console.log(`❌ Удаляем группу ${groupID}`);
                    await groupModel.deleteOne({ _id: groupID });
                    user.groups = user.groups.filter(id => id.toString() !== groupID.toString());
                } else {
                    console.log(`✅ Группа ${groupID} ещё актуальна`);
                }
            }
            await user.save();
            res.status(200).json({ message: 'Группы проверены и удалены при необходимости' });
        } catch (err) {
            console.error('Ошибка при удалении групп:', err);
            res.status(500).json({ error: 'Внутренняя ошибка сервера' });
        }
    }

}

export default MembersController
