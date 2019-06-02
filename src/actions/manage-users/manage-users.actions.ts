import { cognitoClient } from "../../axios/sms-clients/cognito-client";
import { toast } from "react-toastify";
import { ICognitoUser, cognitoRoles } from "../../model/cognito-user.model";
import { userClient } from "../../axios/sms-clients/user-client";

export const manageUsersTypes = {
    GET_USERS: 'MANAGE_GET_USERS',
    UPDATE_SEARCH_EMAIL: 'UPDATE_SEARCH_EMAIL',
    UPDATE_SEARCH_OPTION: 'UPDATE_SEARCH_OPTION'
}

export const manageGetUsersByGroup = (groupName: string, email: string, page?: number) => async (dispatch: any) => {
    console.log('groupName = ' + email)
    console.log('groupName = ' + groupName)
    page || (page = 0);
    groupName && (groupName = groupName.toLocaleLowerCase());
    try {
        let userMap = new Map<string, ICognitoUser>();
        let emailList: string[] = [];
        let userInfoRespPromise;

        let adminResponsePromise;
        let stagingManagerResponsePromise;
        let trainerResponsePromise;

        if (groupName === cognitoRoles.ADMIN) {
            adminResponsePromise = cognitoClient.findUsersByGroup(cognitoRoles.ADMIN);
            const adminResponse = await adminResponsePromise;
            emailList = adminResponse.data.Users.map(user =>
                user.Attributes.find((attr: any) => attr.Name === 'email').Value);
        }
        else if (groupName === cognitoRoles.STAGING_MANAGER) {
            stagingManagerResponsePromise = cognitoClient.findUsersByGroup(cognitoRoles.STAGING_MANAGER);
            const stagingManagerResponse = await stagingManagerResponsePromise;
            emailList = stagingManagerResponse.data.Users.map(user =>
                user.Attributes.find((attr: any) => attr.Name === 'email').Value);
        }
        else if (groupName === cognitoRoles.TRAINER) {
            trainerResponsePromise = cognitoClient.findUsersByGroup(cognitoRoles.TRAINER);
            const trainerResponse = await trainerResponsePromise;
            emailList = trainerResponse.data.Users.map(user =>
                user.Attributes.find((attr: any) => attr.Name === 'email').Value);
        }
        else {
            adminResponsePromise = cognitoClient.findUsersByGroup(cognitoRoles.ADMIN);
            stagingManagerResponsePromise = cognitoClient.findUsersByGroup(cognitoRoles.STAGING_MANAGER);
            trainerResponsePromise = cognitoClient.findUsersByGroup(cognitoRoles.TRAINER);
        }

        if (emailList.length) {
            if (email) {
                emailList = emailList.filter((currentEmail) => currentEmail.toLocaleLowerCase().includes(email));
            }
            userInfoRespPromise = userClient.findAllByEmails(emailList, page);
        } else if (email) {
            userInfoRespPromise = userClient.findUsersByPartialEmail(email, page);
        } else {
            userInfoRespPromise = userClient.findAllUsers(page);
        }

        if (adminResponsePromise) {
            const adminResponse = await adminResponsePromise;
            addUserRolesToMap(cognitoRoles.ADMIN, adminResponse.data.Users, userMap);
        }
        if (stagingManagerResponsePromise) {
            const stagingManagerResponse = await stagingManagerResponsePromise;
            addUserRolesToMap(cognitoRoles.STAGING_MANAGER, stagingManagerResponse.data.Users, userMap);
        }
        if (trainerResponsePromise) {
            const trainerResponse = await trainerResponsePromise;
            addUserRolesToMap(cognitoRoles.TRAINER, trainerResponse.data.Users, userMap);
        }


        //add user names
        let userInfoResp = await userInfoRespPromise;
        const userServiceUserList = userInfoResp.data.content;
        const pageTotal = userInfoResp.data.totalPages;


        let listOfUsers = new Array<ICognitoUser>();
        for (let i = 0; i < userServiceUserList.length; i++) {
            let potentialUser = userMap.get(userServiceUserList[i].email)
            let altenateUser = {
                firstName: userServiceUserList[i].firstName,
                lastName: userServiceUserList[i].lastName,
                email: userServiceUserList[i].email,
                roles: new Array<string>()
            };
            if (potentialUser) {
                altenateUser.roles = potentialUser.roles
                console.log(altenateUser.roles);
            }

            // add user only if group filter allows
            if (altenateUser.roles.includes(groupName)) {
                listOfUsers.push(altenateUser);
            }
            else if (groupName === 'all') {
                listOfUsers.push(altenateUser);
            }
        }

        dispatch({
            payload: {
                manageUsers: listOfUsers,
                manageUsersCurrentPage: page,
                manageUsersPageTotal: pageTotal
            },
            type: manageUsersTypes.GET_USERS
        })
    } catch (e) {
        toast.warn('Unable to retreive users')
        dispatch({
            payload: {
            },
            type: ''
        })
    }
}

export const updateSearchEmail = (newEmailSearch: string) => async (dispatch: any) => {
    dispatch({
        payload: {
            emailSearch: newEmailSearch,
        },
        type: manageUsersTypes.UPDATE_SEARCH_EMAIL
    });
}

export const updateSearchOption = (newSearchOption: string) => async (dispatch: any) => {
    dispatch({
        payload: {
            option: newSearchOption,
        },
        type: manageUsersTypes.UPDATE_SEARCH_OPTION
    });
}

function addUserRolesToMap(role: string, users, userMap: Map<string, ICognitoUser>) {
    for (let i = 0; i < users.length; i++) {
        const currentCognitoUser = users[i];
        const currentEmail = currentCognitoUser.Attributes.find((attr: any) => attr.Name === 'email').Value;
        const mapUser = userMap.get(currentEmail)
        let newUser: ICognitoUser = mapUser ? mapUser : {
            email: currentEmail,
            roles: []
        };
        newUser.roles.push(role);
        userMap.set(newUser.email, newUser);
    }
}