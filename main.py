import tkinter as tk
import os
from tkinter import messagebox
from ttkbootstrap import Style

def get_hostname():
    return os.uname().nodename

def get_username():
    return os.getlogin()

def get_current_path():
    return os.getcwd()

def update_expected_text():
    return f"{get_current_path()}\n{get_hostname()}@{get_username()}:"

def validate(new_value):
    expected_text = update_expected_text()
    return new_value.startswith(expected_text)

def on_entry_change(event):
    expected_text = update_expected_text()
    current_text = text_input.get("1.0", tk.END).strip()
    if not current_text.startswith(expected_text):
        text_input.delete("1.0", tk.END)
        text_input.insert(tk.END, expected_text)

def change_directory(new_dir):
    try:
        os.chdir(new_dir)
        text_input.delete("1.0", tk.END)
        text_input.insert(tk.END, update_expected_text())
    except OSError:
        messagebox.showerror("Error", f"Failed to change directory to {new_dir}")

def process_input(event):
    user_input = text_input.get("1.0", tk.END).strip()
    if user_input.startswith(update_expected_text()):
        command = user_input[len(update_expected_text()):].strip()
        if command.startswith("cd "):
            change_directory(command[3:])
        else:
            output_text = output(command)
            text_output.insert(tk.END, f"\n\nUser entered: {user_input}\nOutput: {output_text}")
            text_input.delete("1.0", tk.END)  # Clear the input area after processing
    else:
        messagebox.showerror("Error", "Invalid command format.")

def output(command):
    result = os.popen(command).read()
    return result.strip()

root = tk.Tk()
root.title("Coffee")
root.geometry("500x400")
style = Style('superhero')

text_input = tk.Text(root, wrap=tk.WORD, height=4, width=60)
text_input.pack(side="top", fill="x", padx=20, pady=20, expand=True)
text_input.insert(tk.END, update_expected_text())

text_output = tk.Text(root, wrap=tk.WORD, height=10, width=60)
text_output.pack(side="bottom", fill="both", padx=20, pady=20, expand=True)

text_input.bind("<KeyRelease>", on_entry_change)
text_input.bind("<Return>", process_input)

root.mainloop()
