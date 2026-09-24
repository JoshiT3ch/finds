export type MessagingActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export const initialMessagingActionState: MessagingActionState = {
  status: "idle",
  message: "",
};
