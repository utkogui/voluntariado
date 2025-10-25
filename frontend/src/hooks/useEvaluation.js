import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvaluations,
  createEvaluation,
  updateEvaluation,
  deleteEvaluation,
  reportEvaluation,
  setSelectedEvaluation,
  clearError
} from '../store/slices/evaluationSlice';

const useEvaluation = () => {
  const dispatch = useDispatch();
  const { evaluations, selectedEvaluation, isLoading, error } = useSelector(state => state.evaluation);

  const loadEvaluations = useCallback((filters = {}) => {
    dispatch(fetchEvaluations(filters));
  }, [dispatch]);

  const handleCreateEvaluation = useCallback(async (evaluationData) => {
    try {
      const result = await dispatch(createEvaluation(evaluationData)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleUpdateEvaluation = useCallback(async (evaluationId, evaluationData) => {
    try {
      const result = await dispatch(updateEvaluation({ id: evaluationId, data: evaluationData })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleDeleteEvaluation = useCallback(async (evaluationId) => {
    try {
      await dispatch(deleteEvaluation(evaluationId)).unwrap();
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleReportEvaluation = useCallback(async (evaluationId, reportData) => {
    try {
      const result = await dispatch(reportEvaluation({ evaluationId, reportData })).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  }, [dispatch]);

  const handleSetSelectedEvaluation = useCallback((evaluation) => {
    dispatch(setSelectedEvaluation(evaluation));
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    evaluations,
    selectedEvaluation,
    isLoading,
    error,
    loadEvaluations,
    createEvaluation: handleCreateEvaluation,
    updateEvaluation: handleUpdateEvaluation,
    deleteEvaluation: handleDeleteEvaluation,
    reportEvaluation: handleReportEvaluation,
    setSelectedEvaluation: handleSetSelectedEvaluation,
    clearError: handleClearError
  };
};

export default useEvaluation;
