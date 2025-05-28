import { revalidatePath } from "next/cache";

export function revalidateProfilePage(username: string) {
  revalidatePath(`/${username}`);
  console.log(`Revalidated profile page: /${username}`);
}

export function revalidateAllProfiles() {
  revalidatePath("/[username]", "page");
  console.log("Revalidated all profile pages");
}

export function revalidateMultipleProfiles(usernames: string[]) {
  usernames.forEach((username) => {
    revalidatePath(`/${username}`);
  });
  console.log(`Revalidated ${usernames.length} profile pages:`, usernames);
}
