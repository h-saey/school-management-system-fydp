export const API_BASE = "http://localhost:5036/api";

const getToken = () => localStorage.getItem("token");

export const updateAttendance = async (id: number, status: string) => {
  const res = await fetch(`${API_BASE}/attendance/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      status,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update attendance");
  }

  return await res.json();
};

export const updateMarks = async (id: number, marksObtained: number) => {
  const res = await fetch(`${API_BASE}/mark/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({
      marksObtained,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update marks");
  }

  return await res.json();
};
