import type { HealthSummary, ShellData, TaskStatus } from "../types/shell";
import { fallbackShellData } from "./mock-shell-data";

type SpecResponse<T> = {
  isSuccess: boolean;
  responseCode: number;
  responseMessage: string;
  result: T;
};

type LegacyApiResponse<T> = {
  success: boolean;
  data: T;
  error?: {
    code?: string;
    message: string;
    details?: unknown;
  } | null;
};

type ValidationError = {
  fieldName: string;
  rejectValue: unknown;
  message: string;
};

type ErrorResult = {
  errors?: ValidationError[];
};

export class ApiRequestError extends Error {
  status: number;
  responseCode?: number;
  details?: unknown;

  constructor(
    message: string,
    status: number,
    responseCode?: number,
    details?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.responseCode = responseCode;
    this.details = details;
  }
}

export type JwtInfo = {
  grantType?: string;
  accessToken: string;
  refreshToken: string;
};

export type AuthUser = {
  userId: number;
  email: string;
  name?: string;
  university?: string;
  phone?: string;
  jwtInfo: JwtInfo;
};

export type LoginResult = {
  userId: number;
  email: string;
  jwtInfo: JwtInfo;
};

export type ProjectRole = "LEADER" | "MEMBER";

export type ProjectCreateRequest = {
  projectName: string;
  subject: string;
  description?: string;
  startDate: string;
  endDate: string;
};

export type ProjectCreateResult = {
  projectId: number;
  projectName: string;
  role: ProjectRole;
};

export type ProjectSummary = {
  projectId: number;
  projectName: string;
  subject: string;
  role: ProjectRole;
  endDate: string;
};

export type ProjectDetail = {
  projectId: number;
  projectName: string;
  subject: string;
  description: string;
  startDate: string;
  endDate: string;
  memberCount: number;
};

export type ProjectUpdateResult = ProjectDetail & {
  updatedAt: string;
};

export type MemberSummary = {
  memberId: number;
  name: string;
  email: string;
  role: ProjectRole;
};

export type TaskCreateRequest = {
  title: string;
  description?: string;
  assigneeId: number;
  dueDate: string;
};

export type TaskCreateResult = {
  taskId: number;
  title: string;
  status: TaskStatus;
  assigneeId: number;
  dueDate: string;
};

export type TaskSummary = {
  taskId: number;
  title: string;
  status: TaskStatus;
  assigneeName: string;
  dueDate: string;
};

export type TaskUpdateRequest = Partial<TaskCreateRequest>;

export type TaskUpdateResult = {
  taskId: number;
  title: string;
  description: string;
  dueDate: string;
};

export type TaskStatusResult = {
  taskId: number;
  status: TaskStatus;
};

export type TaskDependencyResult = {
  taskId: number;
  precedingTaskId: number;
};

export type MeetingCreateRequest = {
  title: string;
  meetingDate: string;
  agenda: string;
  content: string;
  decisions: string[];
  actions: string[];
  attendeeIds: number[];
  actionItems: Array<{
    content: string;
    assigneeId: number;
    dueDate: string;
  }>;
};

export type MeetingSummary = {
  meetingId: number;
  title: string;
  meetingDate: string;
  writerName: string;
  agenda?: string;
  content?: string;
  decisions?: string[];
  actions?: string[];
  attendeeIds?: number[];
  actionItems?: Array<{
    content: string;
    assigneeId: number;
    dueDate: string;
  }>;
};

export type MeetingDetail = {
  meetingId: number;
  projectId: number;
  title: string;
  meetingDate: string;
  agenda: string;
  content: string;
  decisions: string | string[];
  attendees: Array<{
    memberId: number;
    name: string;
  }>;
  actionItems: Array<{
    actionItemId: number;
    content: string;
    assigneeMemberId: number;
    assigneeName: string;
    dueDate: string;
    isCompleted: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  logId: number;
  action: string;
  content: string;
  userName: string;
  createdAt: string;
};

export type RiskLevel = "CAUTION" | "WARNING" | "DANGER";

export type RiskSummary = {
  totalRiskCount: number;
  cautionCount: number;
  warningCount: number;
  dangerCount: number;
  hasDanger: boolean;
};

export type RiskSignalResponse = {
  type: string;
  level: RiskLevel;
  message: string;
  relatedTaskId?: number | null;
  relatedTaskTitle?: string | null;
  relatedMemberId?: number | null;
  relatedMemberName?: string | null;
  affectedTaskIds?: number[];
  remainingDays?: number;
  incompleteTaskCount?: number;
  suggestedActions: string[];
};

export type RisksResult = {
  projectId: number;
  riskSummary: RiskSummary;
  risks: RiskSignalResponse[];
};

export type DashboardResult = RisksResult & {
  projectName: string;
  taskSummary: {
    totalTaskCount: number;
    todoCount: number;
    inProgressCount: number;
    doneCount: number;
    progressRate: number;
  };
  scheduleSummary: {
    projectStartDate: string;
    projectEndDate: string;
    remainingDays: number;
    overdueTaskCount: number;
    dueSoonTaskCount: number;
  };
  memberWorkload: Array<{
    memberId: number;
    name: string;
    assignedTaskCount: number;
    doneTaskCount: number;
  }>;
};

export type UserMe = {
  userId: number;
  email: string;
  studentId: string;
  name: string;
  university: string;
  phone: string;
};

export type InvitationCreateResult = {
  invitationId: number;
  projectId: number;
  inviteCode: string;
  inviteUrl: string;
  expiredAt: string;
};

export type InvitationInfo = {
  inviteCode: string;
  projectId: number;
  projectName: string;
  subject: string;
  teamLeaderName: string;
  expiredAt: string;
  isExpired: boolean;
  isAlreadyJoined: boolean;
};

export type InvitationAcceptResult = {
  projectId: number;
  projectName: string;
  memberId: number;
  userId: number;
  role: ProjectRole;
  joinedAt: string;
};

export type ReportCreateResult = {
  reportId: number;
  downloadUrl: string;
};

const ACCESS_TOKEN_KEY = "teampulse.accessToken";
const REFRESH_TOKEN_KEY = "teampulse.refreshToken";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const apiBaseUrl = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/$/, "")
  : "http://localhost:8080";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function saveAuthTokens(jwtInfo: JwtInfo) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, jwtInfo.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, jwtInfo.refreshToken);
}

export function clearAuthTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  auth = true,
): Promise<T> {
  const token = auth ? getAccessToken() : null;
  const headers = new Headers(init.headers);

  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set(
      "Authorization",
      token.startsWith("Bearer ") ? token : `Bearer ${token}`,
    );
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (payload && typeof payload === "object" && "isSuccess" in payload) {
    const spec = payload as SpecResponse<T | ErrorResult | null>;
    if (!response.ok || !spec.isSuccess) {
      const details =
        spec.result && typeof spec.result === "object"
          ? spec.result
          : undefined;
      throw new ApiRequestError(
        formatErrorMessage(spec.responseMessage, details),
        response.status,
        spec.responseCode,
        details,
      );
    }
    return spec.result as T;
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    const legacy = payload as LegacyApiResponse<T>;
    if (!response.ok || !legacy.success) {
      throw new ApiRequestError(
        legacy.error?.message ?? `요청에 실패했습니다. (${response.status})`,
        response.status,
        undefined,
        legacy.error?.details,
      );
    }
    return legacy.data;
  }

  if (!response.ok) {
    throw new ApiRequestError(
      `요청에 실패했습니다. (${response.status})`,
      response.status,
    );
  }

  return payload as T;
}

function formatErrorMessage(message: string, details?: unknown) {
  if (!details || typeof details !== "object" || !("errors" in details))
    return message;

  const errors = (details as ErrorResult).errors ?? [];
  if (!errors.length) return message;

  return errors.map((error) => error.message).join("\n");
}

export async function loadShellData(): Promise<ShellData> {
  try {
    return await requestJson<ShellData>("/api/demo/shell-data", {}, false);
  } catch {
    return fallbackShellData;
  }
}

export async function loadHealth(): Promise<HealthSummary | null> {
  try {
    return await requestJson<HealthSummary>("/api/health", {}, false);
  } catch {
    return null;
  }
}

export async function signup(input: {
  email: string;
  password: string;
  name: string;
  university: string;
  phone: string;
}) {
  const result = await requestJson<AuthUser>(
    "/api/auth/signup",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    false,
  );
  saveAuthTokens(result.jwtInfo);
  return result;
}

export async function login(input: { email: string; password: string }) {
  const result = await requestJson<LoginResult>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    false,
  );
  saveAuthTokens(result.jwtInfo);
  return result;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  try {
    await requestJson<null>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({
        refreshToken: refreshToken?.startsWith("Bearer ")
          ? refreshToken
          : `Bearer ${refreshToken ?? ""}`,
      }),
    });
  } finally {
    clearAuthTokens();
  }
}

export const projectApi = {
  create(input: ProjectCreateRequest) {
    return requestJson<ProjectCreateResult>("/api/projects", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  list() {
    return requestJson<ProjectSummary[]>("/api/projects");
  },
  get(projectId: number) {
    return requestJson<ProjectDetail>(`/api/projects/${projectId}`, {}, false);
  },
  update(projectId: number, input: ProjectCreateRequest) {
    return requestJson<ProjectUpdateResult>(
      `/api/projects/${projectId}`,
      {
        method: "PATCH",
        body: JSON.stringify(input),
      },
      false,
    );
  },
  dashboard(projectId: number) {
    return requestJson<DashboardResult>(
      `/api/projects/${projectId}/dashboard`,
      {},
      false,
    );
  },
  risks(projectId: number) {
    return requestJson<RisksResult>(`/api/projects/${projectId}/risks`);
  },
  activityLogs(projectId: number) {
    return requestJson<ActivityLog[]>(
      `/api/projects/${projectId}/activity-logs`,
    );
  },
};

export const taskApi = {
  create(projectId: number, input: TaskCreateRequest) {
    return requestJson<TaskCreateResult>(`/api/projects/${projectId}/tasks`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  list(projectId: number) {
    return requestJson<TaskSummary[]>(
      `/api/projects/${projectId}/tasks`,
      {},
      false,
    );
  },
  update(taskId: number, input: TaskUpdateRequest) {
    return requestJson<TaskUpdateResult>(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  remove(taskId: number) {
    return requestJson<null>(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
  updateStatus(taskId: number, status: TaskStatus) {
    return requestJson<TaskStatusResult>(`/api/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  addDependency(taskId: number, precedingTaskId: number) {
    return requestJson<TaskDependencyResult>(
      `/api/tasks/${taskId}/dependencies`,
      {
        method: "POST",
        body: JSON.stringify({ precedingTaskId }),
      },
    );
  },
  removeDependency(taskId: number, dependencyId: number) {
    return requestJson<null>(
      `/api/tasks/${taskId}/dependencies/${dependencyId}`,
      {
        method: "DELETE",
      },
    );
  },
};

export const meetingApi = {
  create(projectId: number, input: MeetingCreateRequest) {
    return requestJson<MeetingSummary[]>(
      `/api/projects/${projectId}/meetings`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
  },
  list(projectId: number) {
    return requestJson<MeetingSummary[]>(`/api/projects/${projectId}/meetings`);
  },
  get(meetingId: number) {
    return requestJson<MeetingDetail>(`/api/meetings/${meetingId}`);
  },
};

export const userApi = {
  me() {
    return requestJson<UserMe>("/api/users/me");
  },
};

export const memberApi = {
  list(projectId: number) {
    return requestJson<MemberSummary[]>(`/api/projects/${projectId}/members`);
  },
  leave(projectId: number) {
    return requestJson<null>(`/api/projects/${projectId}/members/me`, {
      method: "DELETE",
    });
  },
};

export const invitationApi = {
  create(projectId: number) {
    return requestJson<InvitationCreateResult>(
      `/api/projects/${projectId}/invitations`,
      {
        method: "POST",
      },
    );
  },
  get(inviteCode: string) {
    return requestJson<InvitationInfo>(
      `/api/invitations/${inviteCode}`,
      {},
      false,
    );
  },
  accept(inviteCode: string) {
    return requestJson<InvitationAcceptResult>(
      `/api/invitations/${inviteCode}/accept`,
      {
        method: "POST",
      },
    );
  },
};

export const reportApi = {
  create(projectId: number, reportType: "PDF" = "PDF") {
    return requestJson<ReportCreateResult>(
      `/api/projects/${projectId}/reports`,
      {
        method: "POST",
        body: JSON.stringify({ reportType }),
      },
    );
  },
  async download(reportId: number) {
    const token = getAccessToken();
    const headers = new Headers();
    if (token) {
      headers.set(
        "Authorization",
        token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      );
    }

    const response = await fetch(
      `${apiBaseUrl}/api/reports/${reportId}/download`,
      { headers },
    );
    if (!response.ok) {
      throw new ApiRequestError(
        `리포트 다운로드에 실패했습니다. (${response.status})`,
        response.status,
      );
    }
    return response.blob();
  },
};
