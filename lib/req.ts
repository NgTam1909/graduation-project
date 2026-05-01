import axios from 'axios';

function handleUnauthorized(error: unknown) {
	const err = error as {
		response?: { status?: number };
	};

	if (typeof window !== "undefined" && err?.response?.status === 401) {
		localStorage.removeItem("token");
		localStorage.removeItem("user");
		window.location.href = "/login";
	}
}

export async function POST_METHOD(url: string, body: unknown, token?: string) {
	try {
		const { data } = await axios.post(url, body, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: token ? `Bearer ${token}` : undefined,
			},
			withCredentials: true,
		});

		if (data && data.success && data.data) {
			return data.data;
		}

		return data;
	} catch (error) {
		handleUnauthorized(error);
		throw error;
	}
}

export async function PATCH_METHOD(url: string, body: unknown) {
	try {
		const { data } = await axios.patch(url, body, {
			headers: {
				'Content-Type': 'application/json',
			},
			withCredentials: true,
		});

		if (data && data.success && data.data) {
			return data.data;
		}

		return data;
	} catch (error) {
		handleUnauthorized(error);
		throw error;
	}
}

export async function GET_METHOD(url: string, token?: string) {
	try {
		const { data } = await axios.get(url, {
			headers: {
				'Content-Type': 'application/json',
				Authorization: token ? `Bearer ${token}` : undefined,
			},
			withCredentials: true,
		});

		if (data && data.success && data.data) {
			return data.data;
		}

		return data;
	} catch (error) {
		handleUnauthorized(error);
		throw error;
	}
}

export async function DELETE_METHOD(url: string, body?: unknown, token?: string) {
	try {
		const { data } = await axios.delete(url, {
			data: body,
			headers: {
				'Content-Type': 'application/json',
				Authorization: token ? `Bearer ${token}` : undefined,
			},
			withCredentials: true,
		});

		if (data && data.success && data.data) {
			return data.data;
		}

		return data;
	} catch (error) {
		handleUnauthorized(error);
		throw error;
	}
}