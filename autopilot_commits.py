import subprocess
import os

def run_command(command):
    try:
        # encoding='utf-8' is important, but 'text=True' usually handles it. 
        # listing files requires handling potential non-ascii chars, though rare here.
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(e.stderr)
        return None

print("Starting granular commits...")

# Get status
# flushes stdout to ensure we see progress
status_output = run_command("git status --porcelain")

if not status_output:
    print("No changes found to commit.")
    exit()

files = []
for line in status_output.splitlines():
    if not line.strip():
        continue
        
    # porcelain format is "XY filename" or "XY filename -> newfilename"
    # The file path usually starts at index 3.
    # If there's a rename involved (->), we need to handle it, but for now assuming simple modifications/additions.
    # If filename is quoted, handle it.
    
    raw_path = line[3:]
    
    # Check for rename "old -> new"
    if " -> " in raw_path:
        raw_path = raw_path.split(" -> ")[1]
        
    path = raw_path
    
    # Remove quotes if present
    if path.startswith('"') and path.endswith('"'):
        path = path[1:-1]
        
    files.append(path)

print(f"Found {len(files)} files to commit.")

count = 0
for file_path in files:
    count += 1
    # Use formatted string for reliability
    print(f"[{count}/{len(files)}] Processing {file_path}...")
    
    # Git Add
    add_cmd = f'git add "{file_path}"'
    if run_command(add_cmd) is None:
        print(f"Failed to add {file_path}")
        continue
        
    # Git Commit
    filename = os.path.basename(file_path)
    commit_msg = f"update {filename}"
    commit_cmd = f'git commit -m "{commit_msg}"'
    
    res = run_command(commit_cmd)
    if res:
        print(f"Committed: {commit_msg}")
    else:
        print(f"Failed to commit {file_path}")

print("Granular commit process finished.")
