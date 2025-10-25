import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  joinActivity,
  leaveActivity,
  setSelectedDate,
  setSelectedActivity,
  clearError
} from '../store/slices/scheduleSlice';

const useSchedule = () => {
  const dispatch = useDispatch();
  const { activities, selectedDate, selectedActivity, isLoading, error } = useSelector(state => state.schedule);

  const loadActivities = useCallback((filters = {}) => {
    dispatch(fetchActivities(filters));
  }, [dispatch]);

  const handleCreateActivity = useCallback(async (activityData) => {
    try {
      const result = await dispatch(createActivity(activityData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUpdateActivity = useCallback(async (activityId, activityData) => {
    try {
      const result = await dispatch(updateActivity({ id: activityId, data: activityData })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleDeleteActivity = useCallback(async (activityId) => {
    try {
      await dispatch(deleteActivity(activityId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleJoinActivity = useCallback(async (activityId) => {
    try {
      const result = await dispatch(joinActivity(activityId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleLeaveActivity = useCallback(async (activityId) => {
    try {
      const result = await dispatch(leaveActivity(activityId)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetSelectedDate = useCallback((date) => {
    dispatch(setSelectedDate(date));
  }, [dispatch]);

  const handleSetSelectedActivity = useCallback((activity) => {
    dispatch(setSelectedActivity(activity));
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    activities,
    selectedDate,
    selectedActivity,
    isLoading,
    error,
    loadActivities,
    createActivity: handleCreateActivity,
    updateActivity: handleUpdateActivity,
    deleteActivity: handleDeleteActivity,
    joinActivity: handleJoinActivity,
    leaveActivity: handleLeaveActivity,
    setSelectedDate: handleSetSelectedDate,
    setSelectedActivity: handleSetSelectedActivity,
    clearError: handleClearError
  };
};

export default useSchedule;
