export function chooseModel() {
  const models = [
    "gpt-5.2-pro",
    "gpt-5",
    "gpt-5-nano"
  ];

  const randomIndex = Math.floor(Math.random() * models.length);
  return models[randomIndex];
}