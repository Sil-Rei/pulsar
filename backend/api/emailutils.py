import smtplib
import os
from email.mime.text import MIMEText

class Emailutils:

    @staticmethod
    def send_email(to, subject, body):
        email = os.environ.get('EMAIL_HOST_USER')
        password = os.environ.get('EMAIL_HOST_PASSWORD')
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = email
        msg['To'] = to
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(email, password)
        server.sendmail(email, to, msg.as_string())
        print("email send to: " + to)
        server.close()
