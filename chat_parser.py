import re
from collections import Counter
import json
from datetime import datetime
import emoji

# Predefined format constants
DATE_FORMAT = "%d/%m/%y"  # assuming dd/mm/yy based on logs

try:
    with open("chat.txt", encoding="utf-8") as f:
        lines = f.readlines()
except FileNotFoundError:
    print("chat.txt not found.")
    lines = []

total = 0
users = Counter()
hours = Counter()
dates = Counter()

all_emojis = []
first_message_per_day = {}
first_message = None

def is_system_message(msg):
    # Common WhatsApp default status strings
    msg_lower = msg.lower()
    if "end-to-end encrypted" in msg_lower:
        return True
    if "is a contact" in msg_lower:
        return True
    if "deleted this message" in msg_lower:
        return True
    return False

for line in lines:
    # Try BOTH formats
    match1 = re.match(r"(\d+/\d+/\d+),\s*(\d+):(\d+).*?([APap][Mm])? - (.*?):\s*(.*)", line)
    match2 = re.match(r"\[(\d+/\d+/\d+),?\s+(\d+):(\d+):\d+.*?([APap][Mm])\]\s*(.*?):\s*(.*)", line)

    match = match1 if match1 else match2

    if match:
        total += 1

        date = match.group(1)
        hour = int(match.group(2))
        minute = int(match.group(3))
        ampm = match.group(4)
        user = match.group(5)
        message = match.group(6).strip()

        # Normalize hour
        if ampm:
            ampm = ampm.upper()
            if ampm == "PM" and hour != 12:
                hour += 12
            elif ampm == "AM" and hour == 12:
                hour = 0
                
        # First message logically (excluding system msgs)
        if first_message is None and not is_system_message(message):
            first_message = {"sender": user, "message": message}

        # Safe tracking
        users[user] += 1
        hours[hour] += 1
        dates[date] += 1

        # Emojis in message
        ems = [c for c in message if emoji.is_emoji(c)]
        all_emojis.extend(ems)

        # First texter per day
        if date not in first_message_per_day:
            if not is_system_message(message):
                first_message_per_day[date] = user

# Longest streak calculation
date_objects = []
first_date_str = ""
for d in dates.keys():
    try:
        date_objects.append(datetime.strptime(d, "%d/%m/%y"))
    except ValueError:
        pass

date_objects.sort()
if date_objects:
    first_date_str = date_objects[0].strftime("%Y-%m-%dT%H:%M:%S")

longest_streak = 0
current_streak = 0

for i in range(len(date_objects)):
    if i == 0:
        current_streak = 1
    else:
        delta = (date_objects[i] - date_objects[i-1]).days
        if delta == 1:
            current_streak += 1
        elif delta > 1:
            current_streak = 1
    longest_streak = max(longest_streak, current_streak)

# Stats Calculation
top_sender = users.most_common(1)[0][0] if users else "N/A"
active_hour = hours.most_common(1)[0][0] if hours else "N/A"
total_days = len(dates)
messages_per_day = total // total_days if total_days else 0

top_emoji = Counter(all_emojis).most_common(1)[0][0] if all_emojis else "N/A"
first_texters = Counter(first_message_per_day.values())
top_first_texter = first_texters.most_common(1)[0][0] if first_texters else "N/A"

if not first_message:
    first_message = {"sender": "N/A", "message": "N/A"}

data = {
    "totalMessages": total,
    "topSender": top_sender,
    "mostActiveHour": active_hour,
    "messagesPerDay": messages_per_day,
    "firstDate": first_date_str if first_date_str else "2023-01-01T00:00:00",
    "mostUsedEmoji": top_emoji,
    "firstTexter": top_first_texter,
    "totalDaysChatted": total_days,
    "longestStreak": longest_streak,
    "firstMessage": first_message
}

with open("data.json", "w") as f:
    json.dump(data, f, indent=2)

print("✅ data.json created!")
print(data)