import React, {useEffect, useState} from "react";
import api from "../services/api.js";


const Profile =()=>{

const [charities,setCharities]=useState([]);
const [charity,setCharity]=useState("");
const [percentage,setPercentage]=useState(10);



const loadCharities = async()=>{

try{

const {data}=await api.get(
"/api/charities"
);


setCharities(data);


}catch(error){

console.log(error);

}

};



const updateProfile = async()=>{

try{


await api.patch(
"/api/profile",
{
charity,
charityPercentage:Number(percentage)
}
);


alert(
"Profile updated successfully"
);



}catch(error){

console.log(
error.response?.data
);

}

};




useEffect(()=>{

loadCharities();

},[]);



return(

<div className="min-h-screen bg-gray-100 p-6">


<h1 className="text-3xl font-bold mb-6">
Profile Settings
</h1>



<div className="bg-white p-6 rounded-xl shadow max-w-xl">


<label className="block mb-2 font-semibold">
Select Charity
</label>


<select

className="border p-3 w-full rounded"

value={charity}

onChange={(e)=>
setCharity(e.target.value)
}

>


<option>
Choose Charity
</option>


{
charities.map((item)=>(

<option
key={item._id}
value={item._id}
>

{item.name}

</option>

))
}


</select>





<label className="block mt-5 mb-2 font-semibold">
Donation Percentage
</label>



<input

type="number"

min="10"

max="100"

className="border p-3 w-full rounded"

value={percentage}

onChange={(e)=>
setPercentage(e.target.value)
}

/>




<button

onClick={updateProfile}

className="mt-6 bg-blue-600 text-white px-6 py-3 rounded"

>

Save Changes

</button>



</div>


</div>


)

}


export default Profile;