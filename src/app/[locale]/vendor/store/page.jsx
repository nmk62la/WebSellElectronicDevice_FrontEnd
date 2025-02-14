"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Rating } from "@mui/material";
import { getStoreByUserId, updateStore } from "@/api/vendor/storeRequest";
import CbbAddresses from "./cbbDefaultAddress";
import { Toaster } from "@/components/ui/toaster";

const storeSchema = z.object({
  name: z.string().trim().min(1, {
    message: "Tên cửa hàng không được để trống",
  }),
  bio: z.string().nullable(),
});

export default function ManageStoreInfo() {
  const [store, setStore] = useState([]);
  const [defaultAddressToUpdate, setDefaultAddressToUpdate] = useState(null);
  const [addressError, setAddressError] = useState("");

  const { toast } = useToast();

  const formData = useForm({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: "",
      bio: "",
    },
  });

  const fetchStoreByUserId = useCallback(async () => {
    try {
      const response = await getStoreByUserId();
      console.log("fetchStoreByUserId: ", response.result);
      setStore(response.result);
      formData.reset(response.result);
      if (response.result.defaultAddress === null) {
        setDefaultAddressToUpdate({
          defaultAddressStr: "Chọn địa chỉ lấy hàng",
          defaultAddressId: null,
        });
      } else {
        setDefaultAddressToUpdate({
          defaultAddressStr: response.result.defaultAddress,
          defaultAddressId: null,
        });
      }
    } catch (error) {
      console.error("fetchStoreByUserId thất bại: ", error);
      toast({
        title: "Thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [toast, formData]);

  useEffect(() => {
    fetchStoreByUserId();
  }, [fetchStoreByUserId]);

  const handleUpdate = async (storeData) => {
    if (!defaultAddressToUpdate?.defaultAddressId) {
      setAddressError("Vui lòng chọn địa chỉ địa chỉ lấy hàng");
      return;
    }
    setAddressError("");
    const payload = {
      ...storeData,
      bio:
        storeData.bio && storeData.bio.trim() === ""
          ? null
          : storeData.bio?.trim(),
      defaultAddressId: defaultAddressToUpdate?.defaultAddressId,
    };
    try {
      const updated = await updateStore(payload);
      toast({
        title: "Thành công",
        description: "Thông tin cửa hàng đã được cập nhật",
      });
      setStore(updated.result);
      fetchStoreByUserId();
    } catch (error) {
      toast({
        title: "Thất bại",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="shadow-lg rounded-lg">
      <Toaster />
      <CardHeader className="text-center border-b py-6">
        <CardTitle className="text-2xl font-bold">Hồ sơ cửa hàng</CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col items-center gap-6">
        <form
          onSubmit={formData.handleSubmit(handleUpdate)}
          className="w-full space-y-4"
        >
          <div>
            <Label className="text-sm">Tên cửa hàng</Label>
            <div className="w-full space-y-2">
              <Input
                {...formData.register("name")}
                placeholder="tên cửa hàng"
                className="mt-1 w-full border rounded-lg p-2"
              />
              {formData.formState.errors.name && (
                <p className="text-sm text-error col-start-2 col-span-3">
                  {formData.formState.errors.name.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Label className="text-sm">Bio</Label>
            <Textarea
              {...formData.register("bio")}
              placeholder="bio"
              className="mt-1 w-full border rounded-lg p-2"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Đánh giá</Label>
              <span>({store?.rating ? store?.rating.toFixed(1) : "0.0"})</span>
            </div>
            <Rating
              value={store?.rating ? store?.rating : 0}
              precision={0.1}
              readOnly
            ></Rating>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Label className="text-sm">Tổng số sản phẩm :</Label>
              <p>{store?.totalProduct ? store?.totalProduct : 0}</p>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <Label className="text-sm">Địa chỉ lấy hàng</Label>
            <CbbAddresses
              defaultAddressToUpdate={defaultAddressToUpdate}
              onAddressSelect={setDefaultAddressToUpdate}
            />
            {addressError && (
              <p className="text-sm text-error col-start-2 col-span-3">
                {addressError}
              </p>
            )}
          </div>

          <div className="border-t px-6 py-4 flex justify-center">
            <Button type="submit" className="text-xl font-bold">
              Lưu
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
