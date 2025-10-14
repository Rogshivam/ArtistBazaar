import { mockProductData } from "./productData";

/**
 * Simulates the RAG process by filtering mock product data based on the query.
 */
export const fetchRAGContext = async (userQuery: string): Promise<string> => {
  const lowerQuery = userQuery.toLowerCase();
  
  // Define non-significant words to filter out
  const stopWords = /a|an|the|is|are|in|for|of|on|show|me|to|i|want|need|have|any|product|art|item|look|find|what/i;

  // Extract significant keywords
  const significantWords = lowerQuery
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.test(w));

  // Determine if it's a general shopping query to return all products as a fallback
  const isGeneralShoppingQuery = significantWords.length === 0 && lowerQuery.length > 3;

  let relevantProducts = [];

  if (isGeneralShoppingQuery) {
    relevantProducts = mockProductData.slice(0, 5);
  } else {
    // Core robust search logic
    relevantProducts = mockProductData.filter((p) => {
      const productSearchableString = [
        p.name,
        p.description,
        p.category,
        p.artisan,
        p.location,
        p.tags.join(" "),
      ]
        .join(" ")
        .toLowerCase();

      // Check if ANY of the significant words match the product string
      return significantWords.some((word) => productSearchableString.includes(word));
    });
  }

  if (relevantProducts.length === 0) {
    return "No products found matching the specific query in the catalog.";
  }

  // Format the data as RAG context for Gemini (Limit to top 5 results)
  const productContext = relevantProducts
    .slice(0, 5)
    .map(
      (p) =>
        `ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Price: ${p.price}, Description: ${p.description.substring(0, 100)}..., URL: ${p.url}`
    )
    .join("\n---\n");

  return productContext;
};
