import { Router, Application } from 'express'
import MembersController from '../controllers/membersController'

const router = Router()


router.post('/registration', MembersController.registration as unknown as Application)
router.post('/login', MembersController.login)
router.get('/activate/:link', MembersController.activate as unknown as Application)
router.get('/refresh', MembersController.refresh)
router.get('/getUsers', MembersController.getUsers)
router.post('/addImg', MembersController.addImg)
router.get('/getImg/:email', MembersController.getImg)
router.post('/addLocation', MembersController.addLocation)
router.get('/getLocation/:email', MembersController.getLocation)
router.post('/addFriend', MembersController.addFriend)
router.get('/getFriends/:email', MembersController.getFriends)
router.post('/autheticate', MembersController.autheticate)
router.post('/addGroup', MembersController.addGroup)
router.post('/addGroupMember', MembersController.addGroupMember)
router.get('/getGroups/:email', MembersController.getGroups)
router.get('/getUser/:email', MembersController.getUser)
router.get('/getFriend/:email', MembersController.getFriend)
router.post('/changeImg', MembersController.changeImg)
router.post('/comeInGroup', MembersController.comeInGroup)
router.delete('/deleteGroups/:email', MembersController.deleteGroups)
router.post('/findFriends', MembersController.findFriends)
export default router
