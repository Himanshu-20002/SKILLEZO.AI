'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { applicationService } from "@/services/application.service";
import {
  ApplicationListItem,
  ApplicationRecord,
  ApplicationStatus,
} from "@/types/application";
import { toast } from "sonner";

export interface ApplicationsFilterState {
  status: string;
  search: string;
  page: number;
  limit: number;
}

export function useApplications(initialFilters: Partial<ApplicationsFilterState> = {}) {
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const [filters, setFilters] = useState<ApplicationsFilterState>({
    status: initialFilters.status || "all",
    search: initialFilters.search || "",
    page: initialFilters.page || 1,
    limit: initialFilters.limit || 20,
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await applicationService.getMyApplicationsList({
        page: filters.page,
        limit: filters.limit,
        status: filters.status !== "all" ? filters.status : undefined,
        search: filters.search.trim() || undefined,
      });

      setApplications(res.items);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      const msg = err.message || "Failed to load applications";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const updateStatus = async (
    applicationId: string,
    status: ApplicationStatus,
    reason?: string
  ): Promise<ApplicationRecord | null> => {
    try {
      setIsMutating(true);
      const updated = await applicationService.updateApplicationStatus(applicationId, status, reason);
      toast.success(`Application status updated to ${status}`);
      await fetchApplications();
      return updated;
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const addNote = async (
    applicationId: string,
    note: string
  ): Promise<ApplicationRecord | null> => {
    try {
      setIsMutating(true);
      const updated = await applicationService.addTimelineNote(applicationId, note);
      toast.success("Note added to timeline");
      await fetchApplications();
      return updated;
    } catch (err: any) {
      toast.error(err.message || "Failed to add note");
      return null;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteApplication = async (applicationId: string): Promise<boolean> => {
    try {
      setIsMutating(true);
      await applicationService.deleteApplication(applicationId);
      toast.success("Application deleted");
      await fetchApplications();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete application");
      return false;
    } finally {
      setIsMutating(false);
    }
  };

  const setStatusFilter = (status: string) => {
    setFilters((prev) => ({ ...prev, status, page: 1 }));
  };

  const setSearchQuery = (search: string) => {
    setFilters((prev) => ({ ...prev, search, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return {
    applications,
    total,
    totalPages,
    loading,
    error,
    isMutating,
    filters,
    setStatusFilter,
    setSearchQuery,
    setPage,
    refresh: fetchApplications,
    updateStatus,
    addNote,
    deleteApplication,
  };
}
