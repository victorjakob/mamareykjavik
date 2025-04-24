// app/tours/payment-success/page.tsx
export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">
        Payment Successful 🎉
      </h1>
      <p className="text-lg">
        Thank you for your booking! We've received your payment and your spot is
        now reserved.
      </p>
      <p className="mt-4 text-sm text-gray-500">
        A confirmation email has been sent. We look forward to seeing you soon!
      </p>
    </div>
  );
}
