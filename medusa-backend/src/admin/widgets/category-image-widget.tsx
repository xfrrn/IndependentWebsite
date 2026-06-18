import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading, Input, Text, toast } from "@medusajs/ui";
import { useEffect, useState } from "react";

type CategoryImageWidgetProps = {
  data?: {
    id: string;
    metadata?: Record<string, unknown> | null;
    name?: string | null;
  };
};

function getCategoryImage(metadata?: Record<string, unknown> | null) {
  const image =
    metadata?.image ??
    metadata?.image_url ??
    metadata?.thumbnail ??
    metadata?.thumbnail_url;

  return typeof image === "string" ? image : "";
}

const CategoryImageWidget = ({ data }: CategoryImageWidgetProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setImageUrl(getCategoryImage(data?.metadata));
  }, [data?.metadata]);

  const handleSave = async () => {
    if (!data?.id) {
      toast.error("Category is missing");
      return;
    }

    setIsSaving(true);

    try {
      let nextImage = imageUrl.trim();

      if (selectedFile) {
        const formData = new FormData();
        formData.append("files", selectedFile);

        const uploadResponse = await fetch("/admin/uploads", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(await uploadResponse.text());
        }

        const uploadPayload = (await uploadResponse.json()) as {
          files?: { url?: string }[];
        };

        nextImage = uploadPayload.files?.[0]?.url ?? nextImage;
      }

      const metadata: Record<string, unknown> = { ...(data.metadata ?? {}) };

      if (nextImage) {
        metadata.image = nextImage;
      } else {
        delete metadata["image"];
      }

      const response = await fetch(`/admin/product-categories/${data.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ metadata }),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success("Category image saved");
      window.location.reload();
    } catch (error) {
      toast.error("Could not save category image");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <Heading level="h2">Storefront category image</Heading>
        <Text className="text-ui-fg-subtle mt-1" size="small">
          Used by the storefront category circles and menus.
        </Text>
      </div>

      <div className="flex flex-col gap-y-4 p-6">
        {imageUrl ? (
          <div className="overflow-hidden rounded-lg border border-ui-border-base bg-ui-bg-subtle">
            <img
              alt={data?.name || "Category image"}
              className="aspect-video w-full object-cover"
              src={imageUrl}
            />
          </div>
        ) : null}

        <label className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            Upload image
          </Text>
          <input
            accept="image/jpeg,image/png,image/webp"
            className="txt-compact-small min-h-8 rounded-md border border-ui-border-base bg-ui-bg-field px-2 py-1.5 text-ui-fg-base"
            type="file"
            onChange={(event) =>
              setSelectedFile(event.target.files?.[0] ?? null)
            }
          />
        </label>

        <label className="flex flex-col gap-y-2">
          <Text size="small" weight="plus">
            Image URL
          </Text>
          <Input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            placeholder="Optional: paste an existing image URL"
          />
        </label>

        <Button
          size="small"
          type="button"
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save image
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "product_category.details.side.after",
});

export default CategoryImageWidget;
