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
};

const ChatInput: FC<Props> = ({ onSubmit }) => {
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
      className="w-full"
      method="post"
      onSubmit={handleSubmit(async (args) => {
        await onSubmit(args);
        reset();
      })}
    >
      <Controller
        name="message"
        control={control}
        render={({ field, fieldState: _ }) => (
          <Field
          // data-invalid={fieldState.invalid}
          >
            <InputGroup className="mb-4 py-6">
              <InputGroupInput
                {...field}
                placeholder="Ask Anything"
                className="text-lg"
                // aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
              <InputGroupAddon className="pl-4">
                <InputGroupButton>
                  <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
                </InputGroupButton>
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  type="submit"
                  variant={"default"}
                  size={"icon-sm"}
                  className={"shadow-none"}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader /> : <HugeiconsIcon icon={Sent02Icon} strokeWidth={2} />}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
          </Field>
        )}
      />
    </form>
  );
};

export default ChatInput;
