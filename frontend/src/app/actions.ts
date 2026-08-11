// import { revalidatePath } from "next/cache";
import { createConversation } from "@/services/conversations";

// import { SendMessageFormData } from "./schema";

export const createConversationAction = async () => {
  try {
    const conversation = await createConversation();
    // revalidatePath("/c");
    return conversation;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    throw new Error(error.response?.data.detail || error.message);
  }
};
