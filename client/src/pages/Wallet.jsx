
import { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

const Wallet = () => {
  const { user, loadingUser } = useApp();

  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Session abhi check ho raha hai
    if (loadingUser) {
      return;
    }

    // User login nahi hai
    if (!user) {
      setWallet(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    const loadWallet = async () => {
      try {
        setLoading(true);

        console.log(
          "LOADING WALLET FOR USER:",
          user
        );

        // ==============================
        // GET WALLET
        // ==============================

        const walletResponse = await api.get(
          "/wallet"
        );

        console.log(
          "WALLET RESPONSE:",
          walletResponse.data
        );

        if (walletResponse.data?.success) {
          setWallet(
            walletResponse.data.wallet
          );
        }

        // ==============================
        // GET TRANSACTIONS
        // ==============================

        const transactionResponse =
          await api.get(
            "/wallet/transactions"
          );

        console.log(
          "TRANSACTIONS RESPONSE:",
          transactionResponse.data
        );

        if (
          transactionResponse.data?.success
        ) {
          setTransactions(
            transactionResponse.data
              .transactions || []
          );
        }
      } catch (error) {
        console.error(
          "Wallet loading error:",
          error.response?.data ||
            error.message
        );
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, [user, loadingUser]);

  // ==============================
  // LOADING
  // ==============================

  if (loadingUser || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Loading wallet...
        </p>
      </div>
    );
  }

  // ==============================
  // NOT LOGGED IN
  // ==============================

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">
          Please login to view your wallet.
        </p>
      </div>
    );
  }

  // ==============================
  // WALLET UI
  // ==============================

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Wallet
          </h1>

          <p className="text-gray-500 mt-1">
            Manage your winnings and transactions
          </p>
        </div>

        {/* ==============================
            BALANCE
        ============================== */}

        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
          <p className="text-gray-500 text-sm">
            Available Balance
          </p>

          <h2 className="text-4xl font-bold text-gray-900 mt-2">
            ₹{wallet?.balance ?? 0}
          </h2>
        </div>

        {/* ==============================
            TRANSACTIONS
        ============================== */}

        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Transaction History
          </h2>

          {transactions.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                No transactions yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {transactions.map(
                (transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0"
                  >

                    <div>
                      <p className="font-medium text-gray-900">
                        {transaction.description ||
                          "Wallet transaction"}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {transaction.createdAt
                          ? new Date(
                              transaction.createdAt
                            ).toLocaleString()
                          : ""}
                      </p>
                    </div>

                    <div
                      className={
                        transaction.type ===
                        "credit"
                          ? "text-green-600 font-semibold"
                          : "text-red-600 font-semibold"
                      }
                    >
                      {transaction.type ===
                      "credit"
                        ? "+"
                        : "-"}
                      ₹{transaction.amount}
                    </div>

                  </div>
                )
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Wallet;

