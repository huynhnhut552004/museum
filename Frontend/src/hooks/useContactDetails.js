import { useEffect, useState } from "react";
import contentApi from "../api/contentApi";

export default function useContactDetails(lang) {
    const [content, setContent] = useState(null);

    useEffect(() => {
        let cancelled = false;

        contentApi.get("contact")
            .then((response) => {
                const blocks = response.data?.data || [];
                const block = blocks.find((item) => item.block_type === "contact_block") || blocks[0];
                let blockContent = block?.content;

                if (typeof blockContent === "string") {
                    try {
                        blockContent = JSON.parse(blockContent);
                    } catch {
                        blockContent = null;
                    }
                }

                if (!cancelled) setContent(blockContent);
            })
            .catch(() => {
                if (!cancelled) setContent(null);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const localizedContent = content?.[lang] || content?.vi;
    const contactLines = Array.isArray(localizedContent?.hotline)
        ? localizedContent.hotline.filter((item) => typeof item === "string" && item.trim())
        : [];

    return {
        phones: contactLines.filter((item) => !item.includes("@")).slice(0, 2),
        emails: contactLines.filter((item) => item.includes("@")).slice(0, 2),
    };
}