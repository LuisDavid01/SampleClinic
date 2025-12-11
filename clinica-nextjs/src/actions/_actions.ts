"use server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { checkRole } from "@/utils/roles";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

export async function setRole(userId: string, role: string) {
	if (!checkRole("admin")) {
		throw "No eres el admin";
	}
	const client = await clerkClient();

	const user = await currentUser();
	// prevents users from removing themselfs
	if (user?.id === userId) {
		console.log("This user tried to remove himself")
		return;
	}

	await client.users.updateUserMetadata(userId, {
		publicMetadata: {
			role: role,
		},
	});
	revalidatePath("/admin/ManageUsers");
	// Don't return anything
}

export async function removeRole(formData: FormData) {
	if (!checkRole("admin")) {
		return; // or throw an error
	}

	const client = await clerkClient();
	const userId = formData.get("id") as string;

	const user = await currentUser();
	// prevents users from removing themselfs
	if (user?.id === userId) {
		console.log("This user tried to remove himself")
		return;
	}

	await client.users.updateUserMetadata(userId, {
		publicMetadata: {
			role: null,
		},
	});

	revalidatePath("/admin");
	// Don't return anything
}

export async function setRoleWithoutForm(userId: string, role: string) {


	const client = await clerkClient();




	await client.users.updateUserMetadata(userId, {
		publicMetadata: {
			role: role,
		},
	});

	// Don't return anything
}

export async function banUserClerk(userId: string) {
	if (!checkRole("admin")) {
		throw "No eres el admin";
	}
	const client = await clerkClient();

	await client.users.banUser(userId);
	revalidatePath("/admin/ManageUsers");
}

export async function unBanUserClerk(userId: string) {
	if (!checkRole("admin")) {
		throw "No eres el admin";
	}
	const client = await clerkClient();

	await client.users.unbanUser(userId);
	revalidatePath("/admin/ManageUsers");
}

export async function getUsersClerk(query?: string, limit: number = 10, page: number = 1) {
	const user = await auth();
	if (!user.userId) {
		throw "Unautenticated";
	}

	const client = await clerkClient();
	const offset = (page - 1) * limit;
	const { data, totalCount } = query
		? (await client.users.getUserList({ query, limit: limit, offset: offset }))
		: (await client.users.getUserList({ limit: limit, offset: offset }));
		
	const users = data.map(user => ({
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName ?? "",
		email: user.emailAddresses[0].emailAddress,
		role: user.publicMetadata.role,
		imageUrl: user.imageUrl,
		isBanned: user.banned,


	}))
	
	const totalPages = Math.ceil(totalCount / limit);

	const usersData = {
		data: users,
		totalPages: totalPages,
		totalCount: totalCount
	}

	return usersData;


}

