import * as checkInClient from '../../axiosClients/checkInClient/checkInClient';
import { ICheckIn } from '../../model/CheckIn.model';
import { getTodayEnd } from 'src/include/utcUtil';
import { toast } from 'react-toastify';
import { sortCheckInByDate } from '../manager/manager.helpers';

export const associateTypes = {
  CHECK_IN_PAGE_CHANGE: 'CHECK_IN_PAGE_CHANGE',
  INIT: 'INIT',
  SUBMIT_CHECK_IN: 'SUBMIT_CHECK_IN'
}

/**
 * Initiate associate resources
 */
export const associateInit = (userId: number) => (dispatch) => {  
  getAssociateCheckIns(userId)(dispatch);
}

/**
 * Get a list of associate check ins
 * @param userId 
 * @param fromDate 
 * @param toDate 
 */
export const getAssociateCheckIns = (userId: number, fromDate?: number, toDate?: number) => dispatch => {
  if(fromDate == null) {
    fromDate = 0;
  }
  if(toDate == null) {
    toDate = getTodayEnd();
  }
  checkInClient.getCheckInByUserId(userId, fromDate, toDate)
  .then(response => {
    const checkInList = response.data.models.map(checkIn => {
      return checkIn as ICheckIn;
    })
    const list = sortCheckInByDate(checkInList);
    dispatch({
      payload: {
        checkIns: list
      },
      type: associateTypes.INIT
    });
  })
  .catch(error => {
    console.log(error);
  })
}

/**
 * Associate submit a new check in
 * @param description 
 */
export const submitCheckIn = (description: string, userId: number) => dispatch => {
  const body = {
    "checkinDescription": description,
    "userId": userId
  }
  checkInClient.postCheckIn(body)
  .then(response => {
    toast.success("Check in submitted")
    getAssociateCheckIns(userId)(dispatch);
  })
  .catch(error => {
    toast.warn("Unable to submit check in")    
  });
}