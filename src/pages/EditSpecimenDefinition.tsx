import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { updateSpecimenDefinition } from "../services/api/specimenDefinitions";
import { SpecimenDefinitionUpdatePayload } from "../types";
import { useTranslation } from "react-i18next";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug is required")
});

interface FormValues extends SpecimenDefinitionUpdatePayload {}

const EditSpecimenDefinition: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", description: "", slug: "" }
  });

  const mutation = useMutation(
    (data: FormValues) => updateSpecimenDefinition(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["specimenDefinitions"]);
      }
    }
  );

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="edit-specimen-form">
      <div>
        <label htmlFor="name">{t("Name")}</label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              id="name"
              {...field}
              data-testid="name-input"
              className="border p-2"
            />
          )}
        />
      </div>
      <div>
        <label htmlFor="description">{t("Description")}</label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              id="description"
              {...field}
              data-testid="description-input"
              className="border p-2"
            />
          )}
        />
      </div>
      <div>
        <label htmlFor="slug">{t("Slug")}</label>
        <Controller
          name="slug"
          control={control}
          render={({ field }) => (
            <input
              id="slug"
              {...field}
              data-testid="slug-input"
              className="border p-2"
            />
          )}
        />
      </div>
      <button
        type="submit"
        data-testid="submit-button"
        className="bg-blue-500 text-white p-2"
      >
        {t("Save")}
      </button>
    </form>
  );
};

export default EditSpecimenDefinition;
