import * as checkInClient from '../../axiosClients/checkInClient/checkInClient';
import * as cohortClient from '../../axiosClients/cohortClient/cohortClient';
import * as userClient from '../../axiosClients/userClient/userClient';
import * as blakeClient from '../../axiosClients/blakeClient/blakeClient';
import { toast } from "react-toastify";
import { ICheckIn } from '../../model/CheckIn.model';
import { ICohort } from '../../model/Cohort.model';
import { IUserCreateDto } from 'src/model/UserCreateDto.model';
import { IUser } from 'src/model/User.model';
import { getTodayStart, getTodayEnd } from 'src/include/utcUtil';
import { getManagerCohorts, sortCheckInByDate } from './manager.helpers';

export const managerTypes = {
  ADD_CHECK_INS: 'ADD_CHECK_INS',
  ADD_COHORT: 'ADD_COHORT',
  SELECT_COHORT: 'SELECT_COHORT',
  SET_ADMINS: 'SET_ADMINS',
  SET_ASSOCIATE_CHECK_IN_LIST: 'SET_ASSOCIATE_CHECK_IN_LIST',
  SET_ASSOCIATE_LIST: 'SET_ASSOCIATE_LIST',
  SET_CHECK_IN_COMMENT: 'SET_CHECK_IN_COMMENT',
  SET_CHECK_IN_LIST: 'SET_CHECK_IN_LIST',
  SET_COHORT_LIST: 'SET_COHORT_LIST',
  SET_STAGINGS: 'SET_STAGINGS',
  SET_TRAINERS: 'SET_TRAINERS'
}

/**
 * Set up manager list of classes and check-ins
 */
export const managerInit = () => (dispatch) => {
  getManagerCohorts()(dispatch)
  getManagerCheckIn(getTodayStart(), getTodayEnd())(dispatch);
  getAllUsers()(dispatch);
}

/**
 * Update a check in with a comment
 * @param comment 
 */
export const managerPostComment = (managerComments: string, checkinId: number) => dispatch => {
  const body = {
    checkinId,
    managerComments
  }
  checkInClient.postManagerComment(body, checkinId)
    .then(response => {
      toast.success("Comment submitted")
    })
    .catch(error => {
      toast.warn("Unable to submit comment")
    })
}

/**
 * Get a list of manager's check ins
 * @param fromDate 
 * @param toDate  
 */
export const getManagerCheckIn = (fromDate: number, toDate: number) => dispatch => {
  checkInClient.getManagerCheckIn(fromDate, toDate)
    .then(response => {
      const checkinList = response.data.models.map(checkin => {
        return checkin as ICheckIn;
      })
      sortCheckInByDate(checkinList);
      dispatch({
        payload: {
          checkIns: checkinList
        },
        type: managerTypes.SET_CHECK_IN_LIST
      });
    })
    .catch(error => {
      console.log(error);
    })
}

/**
 * Set current render check ins by given user id
 * @param userId 
 * @param fromDate 
 * @param toDate 
 */
export const getCheckInByUserId = (userId: number, fromDate: number, toDate: number) => (dispatch) => {
  checkInClient.getCheckInByUserId(userId, fromDate, toDate)
    .then(response => {
      const checkinList = response.data.models.map(checkin => {
        return checkin as ICheckIn;
      })
      sortCheckInByDate(checkinList);
      
      dispatch({
        payload: {
          associateCheckIns: checkinList
        },
        type: managerTypes.SET_ASSOCIATE_CHECK_IN_LIST
      });
    })
    .catch(error => {
      console.log(error);
    })
}

/**
 * Set the current list of render check ins to the check ins in a given cohort id
 * @param cohortId 
 * @param checkInList 
 * @param cohortList 
 */
export const getCheckInByCohortId = (cohortId: number, fromDate: number, toDate: number) => dispatch => {
  checkInClient.getCheckInByCohortId(cohortId, fromDate, toDate)
    .then(response => {
      const checkinList = response.data.models.map(checkin => {
        return checkin as ICheckIn;
      })
      sortCheckInByDate(checkinList);
      dispatch({
        payload: {
          checkIns: checkinList
        },
        type: managerTypes.SET_CHECK_IN_LIST
      });
    })
    .catch(error => {
      console.log("error");
    })
}

/**
 * Set the current select cohort to be render
 * @param sCohort 
 */
export const selectCohort = (sCohort: ICohort) => dispatch => {
  setTimeout(() => {
    dispatch({
      payload: {
        currentCohort: sCohort
      },
      type: managerTypes.SELECT_COHORT
    });
  }, 500);
}

/**
 * Create a new cohort
 * @param cohortName 
 * @param cohortDescription 
 * @param userLists 
 */
export const managerPostCohort = (cohortName: string, cohortDescription: string, userList: IUserCreateDto[]) => dispatch => {
  cohortClient.postCohort(cohortName, cohortDescription, userList)
    .then(response => {
      const cohort = response.data as ICohort;
      cohortClient.getUsersByCohortId(cohort.cohortId)
        .then(cohortResponse => {
          cohort.userList = cohortResponse.data.map(user => user as IUser);
          dispatch({
            payload: {
              cohort
            },
            type: managerTypes.ADD_COHORT
          });
        })
    })
    .catch(error => {
      toast.warn(error.response.data.messages)
    })
}

/**
 * Adding a new/existing email to a cohort with optional first name and last name
 * @param cohortId 
 * @param email 
 * @param firstName 
 * @param lastName 
 */
export const managerPostUserToCohort = (cohortId: number, email: string, firstName?: string, lastName?: string) => dispatch => {
  if(firstName == null) {
    firstName = "first name";
  }
  if(lastName == null) {
    lastName = "last name";
  }
  const user = {
    email,
    firstName,
    lastName
  }
  cohortClient.postUser(user)
  .then(response => {
    cohortClient.addUserToCohort(cohortId, response.data.userId)
      .then(resp => {
        toast.success("Successfully created and add user to cohort")
      })
      .catch(err => {
        toast.warn("Created user but unable to add to cohort")
      })
  })
  .catch(error => {
    cohortClient.addUserToCohort(cohortId, error.response.data.userId)
      .then(resp => {
        toast.success("Successfully add user to cohort")
      })
      .catch(err => {
        toast.warn("Unable to add user to cohort")
      })
  })
}

/**
 * Add an existing email to a cognito group
 * @param email 
 * @param role 
 */
export const addToCognitoGroup = (email: string, role: string) => dispatch => {
  blakeClient.addUserGroup(email, role)
  .then(response => {
    toast.success("User is added to group")
  })
  .catch(console.log)
}

/**
 * Delete an email from a cognito group
 * @param email 
 * @param role 
 */
export const deleteFromCognitoGroup = (email: string, role: string) => dispatch => {
  blakeClient.deleteUserGroup(email, role)
  .then(response => {
    toast.success("User is removed from group")
  })
}

/**
 * Get all users
 */
export const getAllUsers = () => dispatch => {
  userClient.getAllUsers()
  .then(response => {
    const userList = response.data.map(user => {
      return user as IUser;
    })
    dispatch({
      payload: {
        associates:  userList
      },
      type: managerTypes.SET_ASSOCIATE_LIST
    });
  })
}