import axios from "axios";

const API_URL = "https://opentdb.com";

export const getCategories = async () => {
  const response = await axios.get(`${API_URL}/api_category.php`);
  return response.data.trivia_categories;
};

export const getQuestionsByCategory = async (categoryId, amount = 10) => {
  const response = await axios.get(`${API_URL}/api.php`, {
    params: {
      amount,
      category: categoryId,
      type: "multiple"
    }
  });
  return response.data.results;
};
