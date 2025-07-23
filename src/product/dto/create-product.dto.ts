import { Size, Store } from "@/entities"
import { IsArray, IsNotEmpty } from "class-validator";
import { Skus } from "../command/createProduct.command";

export class CreateProductDto{

     @IsNotEmpty()
     name: string;

     @IsNotEmpty()
     description: string;

     @IsNotEmpty()
     cover: string;

     @IsNotEmpty()
     storeId: Store["id"];

     @IsArray()
     skus: Array<Skus>
}