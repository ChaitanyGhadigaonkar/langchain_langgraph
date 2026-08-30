"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { PlusSignIcon, Sent02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";

import { SendMessageFormData, sendMessageSchema } from "@/app/schema";
import Loader from "@/components/loader";
import { Field } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";

type Props = {
  onSubmit: (values: SendMessageFormData) => void | Promise<void>;
  disabled?: boolean;
};

const ChatInput: FC<Props> = ({ onSubmit, disabled = false }) => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<SendMessageFormData>({
    resolver: zodResolver(sendMessageSchema),
    defaultValues: {
      message: "",
    },
  });

  return (
    <form
      className="absolute right-0 bottom-0 left-0 mx-auto w-full max-w-6xl md:px-30"
      method="post"
      onSubmit={handleSubmit(async (args) => {
        await onSubmit(args);
        reset();
      })}
    >
      <div>
        <Controller
          name="message"
          control={control}
          render={({ field }) => (
            <Field>
              <InputGroup className="bg-background mb-4 py-5 shadow-lg">
                <InputGroupInput
                  {...field}
                  placeholder="Ask Anything"
                  className="text-lg"
                  disabled={isSubmitting || disabled}
                  autoComplete="off"
                />
                <InputGroupAddon>
                  <InputGroupButton size={"icon-sm"} disabled={isSubmitting || disabled}>
                    <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                  </InputGroupButton>
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  <InputGroupButton
                    type="submit"
                    variant={"default"}
                    size={"icon-sm"}
                    className={"shadow-none"}
                    disabled={isSubmitting || disabled}
                  >
                    {isSubmitting || disabled ? <Loader /> : <HugeiconsIcon icon={Sent02Icon} strokeWidth={2} />}
                  </InputGroupButton>
                </InputGroupAddon>
              </InputGroup>
            </Field>
          )}
        />
      </div>
    </form>
  );
};

export default ChatInput;
