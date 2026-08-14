import { useEffect, useState } from "react";
import api from "../services/api";
import { useApp } from "../context/AppContext";

const Withdrawal = () => {

  const { user, loadingUser } = useApp();

  const [wallet, setWallet] = useState(null);

  const [withdrawals, setWithdrawals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);


  const [form, setForm] = useState({
    amount: "",
    method: "upi",
    upiId: "",
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
  });


  const [message,setMessage] = useState("");



  // ==========================
  // LOAD DATA
  // ==========================

  const loadData = async()=>{

    try{

      setLoading(true);


      const walletRes =
        await api.get("/wallet");


      if(walletRes.data.success){
        setWallet(
          walletRes.data.wallet
        );
      }



      const withdrawalRes =
        await api.get("/withdrawals");


      if(withdrawalRes.data.success){

        setWithdrawals(
          withdrawalRes.data.withdrawals
        );

      }



    }
    catch(error){

      console.log(
        error.response?.data ||
        error
      );

    }
    finally{

      setLoading(false);

    }

  };




  useEffect(()=>{

    if(!loadingUser && user){

      loadData();

    }

  },[
    user,
    loadingUser
  ]);




  // ==========================
  // HANDLE INPUT
  // ==========================


  const handleChange=(e)=>{

    setForm({
      ...form,
      [e.target.name]:
        e.target.value
    });

  };




  // ==========================
  // SUBMIT WITHDRAWAL
  // ==========================


  const submitWithdrawal =
  async()=>{


    try{


      setSubmitting(true);

      setMessage("");



      const {data} =
        await api.post(
          "/withdrawals",
          form
        );



      if(data.success){

        setMessage(
          "Withdrawal request submitted successfully"
        );


        setForm({
          amount:"",
          method:"upi",
          upiId:"",
          accountHolderName:"",
          accountNumber:"",
          ifscCode:"",
        });


        loadData();


      }
      else{

        setMessage(
          data.message
        );

      }


    }
    catch(error){


      setMessage(
        error.response?.data?.message ||
        "Withdrawal failed"
      );


    }
    finally{

      setSubmitting(false);

    }

  };




  if(
    loading ||
    loadingUser
  ){

    return(
      <div className="min-h-screen flex items-center justify-center">
        Loading withdrawal...
      </div>
    )

  }



  return (

<div className="min-h-screen bg-gray-50 py-10 px-6">

<div className="max-w-5xl mx-auto">


<h1 className="text-3xl font-black text-[#173f2b]">
My Withdrawal
</h1>

<p className="text-gray-500 mt-2">
Withdraw your ImpactDraw winnings
</p>




{/* BALANCE */}

<div className="bg-white border rounded-2xl p-6 mt-8">


<p className="text-gray-500">
Available Balance
</p>


<h2 className="text-4xl font-black mt-2 text-[#173f2b]">

₹{wallet?.balance || 0}

</h2>


</div>





{/* FORM */}


<div className="bg-white border rounded-2xl p-6 mt-8">


<h2 className="text-xl font-bold mb-5">
Request Withdrawal
</h2>




<input

type="number"

name="amount"

value={form.amount}

onChange={handleChange}

placeholder="Enter amount"

className="w-full border rounded-xl px-4 py-3 mb-4"

/>




<select

name="method"

value={form.method}

onChange={handleChange}

className="w-full border rounded-xl px-4 py-3 mb-4"

>

<option value="upi">
UPI
</option>


<option value="bank">
Bank Account
</option>


</select>





{
form.method==="upi" && (

<input

name="upiId"

value={form.upiId}

onChange={handleChange}

placeholder="UPI ID"

className="w-full border rounded-xl px-4 py-3 mb-4"

/>

)

}




{
form.method==="bank" && (

<div>


<input

name="accountHolderName"

value={form.accountHolderName}

onChange={handleChange}

placeholder="Account Holder Name"

className="w-full border rounded-xl px-4 py-3 mb-4"

/>



<input

name="accountNumber"

value={form.accountNumber}

onChange={handleChange}

placeholder="Account Number"

className="w-full border rounded-xl px-4 py-3 mb-4"

/>



<input

name="ifscCode"

value={form.ifscCode}

onChange={handleChange}

placeholder="IFSC Code"

className="w-full border rounded-xl px-4 py-3 mb-4"

/>


</div>

)

}




<button

onClick={submitWithdrawal}

disabled={submitting}

className="bg-[#d89b28] text-white px-8 py-3 rounded-xl font-bold"

>

{
submitting
?
"Submitting..."
:
"Withdraw"
}

</button>



{
message && (

<p className="mt-4 text-sm font-semibold">

{message}

</p>

)

}


</div>






{/* HISTORY */}


<div className="bg-white border rounded-2xl p-6 mt-8">


<h2 className="text-xl font-bold mb-5">
Withdrawal History
</h2>




{
withdrawals.length===0 ?

<p className="text-gray-500">
No withdrawal requests
</p>


:


<div className="space-y-4">


{
withdrawals.map((item)=>(


<div

key={item._id}

className="border-b pb-4 flex justify-between"

>


<div>

<p className="font-bold">

₹{item.amount}

</p>


<p className="text-sm text-gray-500">

{item.method}

</p>


</div>




<span
className={`font-bold
${
item.status==="approved"
?
"text-green-600"
:
item.status==="rejected"
?
"text-red-600"
:
"text-yellow-600"
}
`}
>

{item.status}

</span>


</div>


))

}


</div>


}



</div>



</div>

</div>


  );

};


export default Withdrawal;