#!/usr/bin/env ruby
require 'rubygems'
require_relative 'ofx-parser/lib/ofx-parser'
require 'csv'

ofx_path = ARGV.shift
output_path = ARGV.shift
ofx = OfxParser::OfxParser.parse(ofx_path && File.exists?(ofx_path) ? open(ofx_path) : STDIN)
account = ofx.bank_account

if output_path
  $stdout.reopen(output_path, "w")
end

date_format = "%d/%m/%Y"

#p account
puts "sep=,"
puts [account.routing_number || "", account.number || "", account.balance || "", 
      account.balance_date.strftime(date_format) || ""].to_csv
puts [account.statement.currency || "", account.statement.start_date.strftime(date_format) || "", 
      account.statement.end_date.strftime(date_format) || ""].to_csv

account.statement.transactions.each do |transaction|
  date = transaction.date.strftime(date_format) || ""
  payee = transaction.payee || ""
  memo = transaction.memo || ""
  type = transaction.type || ""
  amount = (transaction.amount || "").gsub(".", ",")
  puts [date, payee, memo, type, amount].to_csv
end 
