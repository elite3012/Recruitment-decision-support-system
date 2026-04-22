# -*- coding: utf-8 -*-
import pandas as pd
import numpy as np

jobs = pd.read_csv('data/raw/JOB_DATA_FINAL.csv')

driver_jobs = jobs[jobs['Industry'].str.contains('vận tải|lái xe|giao nhận|kho vận|logistics', case=False, na=False)]
sales_jobs = jobs[jobs['Industry'].str.contains('Kinh doanh|Bán hàng', case=False, na=False)]
admin_jobs = jobs[jobs['Industry'].str.contains('Hành chính|Văn phòng', case=False, na=False)]
account_jobs = jobs[jobs['Industry'].str.contains('Kế toán|Kiểm toán', case=False, na=False)]

d_sample = driver_jobs.sample(40, random_state=42) if len(driver_jobs) >= 40 else driver_jobs
s_sample = sales_jobs.sample(30, random_state=42) if len(sales_jobs) >= 30 else sales_jobs
a_sample = admin_jobs.sample(15, random_state=42) if len(admin_jobs) >= 15 else admin_jobs
ac_sample = account_jobs.sample(15, random_state=42) if len(account_jobs) >= 15 else account_jobs

final_sample = pd.concat([d_sample, s_sample, a_sample, ac_sample])
final_sample = final_sample.sample(frac=1, random_state=42).reset_index(drop=True).head(100)

jobs.to_csv('data/raw/JOB_DATA_FINAL_BACKUP.csv', index=False)
final_sample.to_csv('data/raw/JOB_DATA_FINAL.csv', index=False)
print('Da giam so luong jobs xuong con 100 theo nhung industry pho bien.')
