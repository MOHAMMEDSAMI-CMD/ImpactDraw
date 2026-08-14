import { useEffect, useState } from "react";
import api from "../../services/api";


const AdminWithdrawals = () => {

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");


  // ==========================
  // LOAD WITHDRAWALS
  // ==========================

  const loadWithdrawals = async () => {

    try {

      setLoading(true);

      const { data } = await api.get(
        "/admin/withdrawals"
      );


      if(data.success){

        setWithdrawals(
          data.withdrawals || []
        );

      }


    } catch(error){

      console.log(
        "LOAD ERROR:",
        error.response?.data
      );

    } finally {

      setLoading(false);

    }

  };



  useEffect(()=>{

    loadWithdrawals();

  },[]);





  // ==========================
  // UPDATE STATUS
  // ==========================


  const updateStatus = async(
    id,
    status
  )=>{

    try{


      const {data} = await api.patch(
        `/admin/withdrawals/${id}`,
        {
          status
        }
      );


      console.log(
        "UPDATE RESPONSE:",
        data
      );


      if(data.success){

        loadWithdrawals();

      }


    }catch(error){

      console.log(
        "UPDATE ERROR:",
        error.response?.data
      );

    }

  };





  // ==========================
  // FILTER
  // ==========================


  const filteredWithdrawals =
    filter === "all"
    ?
    withdrawals
    :
    withdrawals.filter(
      item =>
      item.status === filter
    );





  if(loading){

    return (

      <div className="min-h-screen flex items-center justify-center">

        <p>
          Loading withdrawals...
        </p>

      </div>

    );

  }






  return (

<div className="min-h-screen bg-gray-50 px-6 py-10">


<div className="max-w-6xl mx-auto">



<h1 className="text-3xl font-black text-[#173f2b]">

Withdrawal Requests

</h1>


<p className="text-gray-500 mt-2">

Manage user payout requests

</p>





{/* FILTER BUTTONS */}


<div className="flex gap-3 flex-wrap mt-8">


{
[
"all",
"pending",
"approved",
"paid",
"rejected"

].map(status=>(


<button

key={status}

onClick={()=>setFilter(status)}

className={`
px-5 py-2
rounded-xl
font-bold
capitalize
transition

${
filter===status
?
"bg-[#173f2b] text-white"
:
"bg-white border text-gray-700 hover:bg-gray-100"
}

`}

>

{status}

</button>


))

}


</div>







{/* LIST */}


<div className="mt-8 space-y-5">



{
filteredWithdrawals.length===0

?

(

<div className="bg-white rounded-xl border p-10 text-center">

<p className="text-gray-500">

No withdrawal requests

</p>

</div>

)


:


filteredWithdrawals.map(
(item)=>(


<div

key={item._id}

className="bg-white border rounded-2xl p-6 shadow-sm"

>


<div className="flex justify-between gap-5 flex-col md:flex-row">



{/* USER INFO */}


<div>


<h2 className="text-2xl font-black">

₹{item.amount}

</h2>



<p className="mt-2">

User:

<b>
{" "}
{item.user?.name}
</b>

</p>



<p className="text-sm text-gray-500">

{item.user?.email}

</p>




<p className="mt-3">

Method:

<b>
{" "}
{item.method}
</b>

</p>





{
item.method==="upi"

&&

<p>

UPI:
{" "}
{item.upiId}

</p>

}






{
item.method==="bank"

&&

<div className="text-sm">


<p>
Name:
{item.accountHolderName}
</p>


<p>
Account:
{item.accountNumber}
</p>


<p>
IFSC:
{item.ifscCode}
</p>


</div>

}





</div>







{/* STATUS */}


<div>


<span

className={`
px-4 py-2 rounded-full font-bold text-sm

${
item.status==="paid"

?

"bg-green-100 text-green-700"

:

item.status==="rejected"

?

"bg-red-100 text-red-700"

:

item.status==="approved"

?

"bg-blue-100 text-blue-700"

:

"bg-yellow-100 text-yellow-700"

}

`}

>

{item.status}

</span>


</div>



</div>







{/* ACTIONS */}



<div className="flex gap-3 mt-6 flex-wrap">



{
item.status==="pending"

&&

<>


<button

onClick={()=>
updateStatus(
item._id,
"approved"
)
}

className="px-5 py-2 rounded-xl bg-green-600 text-white font-bold"

>

Approve

</button>





<button

onClick={()=>
updateStatus(
item._id,
"rejected"
)
}

className="px-5 py-2 rounded-xl bg-red-600 text-white font-bold"

>

Reject

</button>


</>

}






{
item.status==="approved"

&&


<button

onClick={()=>
updateStatus(
item._id,
"paid"
)
}

className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"

>

Mark Paid

</button>


}



</div>





</div>



)

)

}



</div>



</div>


</div>

  );

};


export default AdminWithdrawals;