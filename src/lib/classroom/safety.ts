/** Escapes untrusted model/student text before inclusion in exported HTML. */
export function escapeExportHtml(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]!));
}

export function classroomStorageKey(studentId: string, courseId: string): string {
  return `aura_user_${encodeURIComponent(studentId || 'guest')}_classroom_${encodeURIComponent(courseId)}`;
}

export function hasCompletedCourse(modules: Array<{ status: string }>): boolean {
  return modules.length > 0 && modules.every(module => module.status === 'completed');
}
