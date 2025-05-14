---
name: quip_analyzing
type: knowledge
version: 1.0.0
agent: CodeActAgent
triggers:
  - quip
  - analyze quip
---

IMPORTANT! The user need analyzing quip file, you must follow below steps.

---

**🧠 AI Prompt: Quip CSV Industry Builder Ticket Analysis**

You are tasked with analyzing a `.csv` file (previously downloaded from Quip) located in the current working directory. Follow the steps below precisely:

---

### 🔧 Step 1: Identify and Rename the Input File

* The user will specify the filename (e.g., `quip_report.csv`) and the relevant sheet if applicable (e.g., if extracted from Excel to CSV).
* Rename the file by appending the current date and time to the filename.
  Example: `quip_report_2025-05-13_1030.csv`
* If direct renaming is not possible, create a copy with the new name.

---

### 📊 Step 2: Analyze the CSV Using Python

Use `python3` and a virtual environment (`venv`) to install necessary packages (`pandas`, etc.) and perform the analysis.

#### Filtering Requirements:

* Only include rows where:

  * `GM` = `joeyzhu`
  * The builder type is `industry builder`

#### Deduplication and Aggregation:

* Count **unique tickets** and **unique findings** per builder.
* Tickets and findings are **two separate columns** — be sure to distinguish them.
* If a builder has **no findings**, do **not** include them in the final report.

---

### 📄 Step 3: Report Format

The output should be a human-readable industry builder summary like the following:

• Ticket [1502ccee-80a7-4eba-bf03-2a44ae3309b1](https://t.corp.amazon.com/1502ccee-80a7-4eba-bf03-2a44ae3309b1): Cognito Unauthenticated Role with Admin/Privilege Access

```
📊 Industry Builder Ticket Analysis Report - [DATE TIME]
Industry Builder Ticket Analysis for GM: joeyzhu

Key Findings:
• Total tickets under GM joeyzhu: <X>
• Industry builders with tickets: <Y>
• Top issue: <most frequent issue>

Detailed Builder Information:
@<builder_name>
: <N> tickets (<M> findings)
Ticket IDs: [id1](link1), [id2](link2), ...
Top issues: <summary>
Issue details:
• Ticket [id1](link1): <finding description>
...

Ownership Verification Results (if applicable):
• Ticket [idX](linkX) is assigned to <actual owner>, not <listed owner>
...

Next steps:
• Verify the report with the original Quip document with quip link
• Update ticket ownership in tracking systems
• Notify each builder about their assignments
```

---

### 💾 Step 4: Save Output

* Save the final report to a `.txt` file in the same directory.
* File name must also include the current date and time.
  Example: `industry_ticket_report_2025-05-13_1030.txt`

---

### 📤 Step 5: Post Report to Slack

* Once the `.txt` report is generated, read the txt file and **send the entire txt file content** of the report file to the Slack channel: `my-bot-testing`
* Ensure the formatting is preserved (use a code block or proper message formatting if needed)

---