import { useEffect } from "react";

export default function TelegramLoginButton() {
  useEffect(() => {
    // Объявляем глобально функцию для Telegram
    window.onTelegramAuth = async function (user) {
      try {
        const res = await fetch("https://backend-service-p8bw.onrender.com/api/social-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: user.id,
            name: user.first_name,
            username: user.username,
            provider: "telegram"
          }),
        });

        const data = await res.json();

        localStorage.setItem("token", data.token);
        localStorage.setItem("isAdmin", data.isAdmin);

        window.location.href = data.isAdmin ? "/admin" : "/profile";
      } catch (err) {
        console.error("Ошибка Telegram входа:", err);
        alert("Ошибка авторизации через Telegram");
      }
    };

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?7";
    script.async = true;
    script.setAttribute("data-telegram-login", "secureshop_helper_bot"); // ← имя бота
    script.setAttribute("data-size", "large");
    script.setAttribute("data-userpic", "false");
    script.setAttribute("data-request-access", "write");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");

    const container = document.getElementById("telegram-button-container");
    container.innerHTML = "";
    container.appendChild(script);
  }, []);

  return <div id="telegram-button-container" className="flex justify-center" />;
}
