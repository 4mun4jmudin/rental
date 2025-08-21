<!-- <?php 

// namespace App\Http\Controllers\Api;

// use App\Http\Controllers\Controller;
// use App\Models\Car;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;

// class CarController extends Controller
// {
//     public function index()
//     {
//         $cars = Car::all();
//         return response()->json($cars);
//     }

//     public function store(Request $request)
//     {
//         $validator = Validator::make($request->all(), [
//             'brand' => 'required|string|max:50',
//             'model' => 'required|string|max:50',
//             'year' => 'required|integer|min:1900|max:' . date('Y'),
//             'license_plate' => 'required|string|max:15|unique:cars',
//             'price_per_day' => 'required|numeric|min:0',
//         ]);

//         if ($validator->fails()) {
//             return response()->json($validator->errors(), 422);
//         }

//         $car = Car::create($request->all());
//         return response()->json($car, 201);
//     }

//     public function show(Car $car)
//     {
//         return response()->json($car);
//     }

//     public function update(Request $request, Car $car)
//     {
//         $validator = Validator::make($request->all(), [
//             'brand' => 'string|max:50',
//             'model' => 'string|max:50',
//             'year' => 'integer|min:1900|max:' . date('Y'),
//             'license_plate' => 'string|max:15|unique:cars,license_plate,' . $car->id,
//             'price_per_day' => 'numeric|min:0',
//         ]);

//         if ($validator->fails()) {
//             return response()->json($validator->errors(), 422);
//         }

//         $car->update($request->all());
//         return response()->json($car);
//     }

//     public function destroy(Car $car)
//     {
//         $car->delete();
//         return response()->json(['message' => 'Car deleted successfully']);
//     }
// }