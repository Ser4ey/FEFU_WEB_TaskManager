from email.mime.text import MIMEText
import smtplib


class EmailService:
    def __init__(self, host, port, username=None, password=None, use_tls=True):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.use_tls = use_tls

    def send_email(self, user_email, username, task_title, task_time):
        sender_email = self.username if self.username else "noreply@yourdomain.com"
        receiver_email = user_email
        subject = "Уведомление о задаче"
        body = (
            f"Привет, {username}!\n\n"
            f"Это напоминание о задаче: '{task_title}'.\n"
            f"Дедлайн: {task_time}.\n\n"
            f"Хорошего дня!"
        )

        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = sender_email
        msg['To'] = receiver_email

        try:
            server = smtplib.SMTP(self.host, self.port)
            if self.use_tls:
                server.starttls()

            if self.username and self.password:
                server.login(self.username, self.password)

            server.sendmail(sender_email, receiver_email, msg.as_string())
            print(f"Письмо успешно отправлено на {user_email} по задаче '{task_title}'.")

        except Exception as e:
            print(f"Не удалось отправить письмо на {user_email}. Ошибка: {e}")

        finally:
            if 'server' in locals():
                server.quit()
