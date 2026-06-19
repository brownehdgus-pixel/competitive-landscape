"use client";

export function LogoutButton() {
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-memo-muted hover:text-memo-ink hover:underline"
    >
      Logout
    </button>
  );
}
