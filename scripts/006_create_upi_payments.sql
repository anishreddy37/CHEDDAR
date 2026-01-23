-- Create UPI Payments table
CREATE TABLE IF NOT EXISTS upi_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expense_id UUID REFERENCES expenses(id) ON DELETE SET NULL,
  upi_id TEXT NOT NULL,
  payee_name TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_method TEXT DEFAULT 'UPI',
  status TEXT DEFAULT 'initiated', -- initiated, completed, failed, completed_assumed
  transaction_id TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Enable RLS
ALTER TABLE upi_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own payments
CREATE POLICY "Users can see own payments" ON upi_payments
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policy: Users can insert their own payments
CREATE POLICY "Users can insert own payments" ON upi_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own payments
CREATE POLICY "Users can update own payments" ON upi_payments
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_upi_payments_user_id ON upi_payments(user_id);
CREATE INDEX idx_upi_payments_expense_id ON upi_payments(expense_id);
CREATE INDEX idx_upi_payments_status ON upi_payments(status);
