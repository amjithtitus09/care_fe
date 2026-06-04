import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateSpecimenDefinition } from "../services/api/specimenDefinitions";
import { useTranslation } from "react-i18next";
import { SpecimenDefinitionUpdatePayload } from "../types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  slug: z.string().min(1, "Slug is required")
});

type FormData = z.infer<typeof schema>;

const EditSpecimenDefinition: React.FC<{ id: string }> = ({ id }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: specimenDefinition, isLoading } = useQuery([
    "specimenDefinition",
    id
  ], async () => {
    const response = await axios.get(`/api/specimen-definitions/${id}`);
    return response.data;
  });

  const mutation = useMutation(
    (data: SpecimenDefinitionUpdatePayload) =>
      updateSpecimenDefinition(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["specimenDefinition", id]);
      }
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: specimenDefinition?.name || "",
      description: specimenDefinition?.description || "",
      slug: specimenDefinition?.slug || ""
    }
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return <div data-testid="loading">Loading...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} data-testid="edit-specimen-form">
      <div>
        <label htmlFor="name">{t("Name")}</label>
        <input
          id="name"
          {...register("name")}
          data-testid="name-input"
          className="border p-2"
        />
        {errors.name && (
          <span data-testid="name-error">{errors.name.message}</span>
        )}
      </div>

      <div>
        <label htmlFor="description">{t("Description")}</label>
        <textarea
          id="description"
          {...register("description")}
          data-testid="description-input"
          className="border p-2"
        />
        {errors.description && (
          <span data-testid="description-error">
            {errors.description.message}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="slug">{t("Slug")}</label>
        <input
          id="slug"
          {...register("slug")}
          data-testid="slug-input"
          className="border p-2"
        />
        {errors.slug && (
          <span data-testid="slug-error">{errors.slug.message}</span>
        )}
      </div>

      <button
        type="submit"
        data-testid="save-button"
        className="bg-blue-500 text-white p-2 mt-4"
      >
        {t("Save")}
      </button>
    </form>
  );
};

export default EditSpecimenDefinition;