"use client";
import { useEffect } from "react";
import { useState, FormEvent, ChangeEvent } from "react";
import { subscribePlan } from "../actions/subscribe";
import "./pricing.css";

interface FormDataState {
  name: string;
  email: string;
  card: string;
  cvv: string;
  expiry: string;
  address: string;
}

interface ErrorsState {
  name?: string;
  email?: string;
  card?: string;
  cvv?: string;
  expiry?: string;
  address?: string;
}

interface StatusState {
  type: "success" | "error" | "";
  message: string;
}

type PlanType = "Basic" | "Pro" | "Developer";

export default function PricingPage({ darkMode = false }) {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("Basic");
  const [loading, setLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormDataState>({
    name: "",
    email: "",
    card: "",
    cvv: "",
    expiry: "",
    address: ""
  });
  
  const [errors, setErrors] = useState<ErrorsState>({});
  const [submitStatus, setSubmitStatus] = useState<StatusState>({ type: "", message: "" });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "theme") {
        console.log("Theme changed:", event.data.darkMode);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const plans = {
    Basic: { price: 5, description: "Access tech podcasts" },
    Pro: { price: 12, description: "Podcasts + Tech Videos" },
    Developer: { price: 25, description: "Full access + Codebase" }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "card") {
      const cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length <= 16) {
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
      }
    } else if (name === "cvv") {
      const cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length <= 3) {
        setFormData(prev => ({ ...prev, [name]: cleanValue }));
      }
    } else if (name === "expiry") {
      let cleanValue = value.replace(/\D/g, "");
      if (cleanValue.length > 4) return;
      
      if (cleanValue.length > 2) {
        cleanValue = cleanValue.slice(0, 2) + "/" + cleanValue.slice(2);
      }
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name as keyof ErrorsState]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    if (submitStatus.message) {
      setSubmitStatus({ type: "", message: "" });
    }
  };

  const validateForm = (): ErrorsState => {
    const newErrors: ErrorsState = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name too short";
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email";
    }
    
    if (!formData.card) {
      newErrors.card = "Card is required";
    } else if (formData.card.length < 12) {
      newErrors.card = "Invalid card";
    }
    
    if (!formData.cvv) {
      newErrors.cvv = "CVV is required";
    } else if (formData.cvv.length !== 3) {
      newErrors.cvv = "Invalid CVV";
    }
    
    if (!formData.expiry) {
      newErrors.expiry = "Expiry is required";
    } else if (formData.expiry.length !== 5 || !formData.expiry.includes("/")) {
      newErrors.expiry = "Use MM/YY";
    } else {
      const [month, year] = formData.expiry.split("/");
      const currentYear = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth() + 1;
      
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiry = "Invalid month";
      } else if (yearNum < currentYear || 
        (yearNum === currentYear && monthNum < currentMonth)) {
        newErrors.expiry = "Card expired";
      }
    }
    
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitStatus({ 
        type: "error", 
        message: "Please fix the errors" 
      });
      return;
    }
    
    setLoading(true);
    setSubmitStatus({ type: "", message: "" });
    
    try {
      const formDataObj = new FormData();
      formDataObj.append("plan", selectedPlan);
      formDataObj.append("name", formData.name.trim());
      formDataObj.append("email", formData.email.trim());
      formDataObj.append("card", formData.card);
      formDataObj.append("cvv", formData.cvv);
      formDataObj.append("expiry", formData.expiry);
      formDataObj.append("address", formData.address.trim());
      
      await subscribePlan(formDataObj);
      
      setSubmitStatus({ 
        type: "success", 
        message: "Subscription successful!" 
      });
      
      setFormData({
        name: "",
        email: "",
        card: "",
        cvv: "",
        expiry: "",
        address: ""
      });
      setErrors({});
      
    } catch (error) {
      setSubmitStatus({ 
        type: "error", 
        message: "Subscription failed" 
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (cardNumber: string): string => {
    if (!cardNumber) return "";
    return cardNumber.replace(/(\d{4})/g, "$1 ").trim();
  };

  return (
    <div className={`pricingPage ${darkMode ? 'dark-mode' : ''}`}>
      <h1 className="pricingTitle">Developer Learning Plans</h1>

      <div className="pricingCards">
        {(Object.keys(plans) as PlanType[]).map((plan) => (
          <div
            key={plan}
            className={`priceCard ${selectedPlan === plan ? "active" : ""}`}
            onClick={() => setSelectedPlan(plan)}
          >
            <h3>{plan}</h3>
            <p>{plans[plan].description}</p>
            <h2>${plans[plan].price}<span>/mo</span></h2>
          </div>
        ))}
      </div>

      <div className="subscribeForm">
        <h2>Subscribe to {selectedPlan}</h2>

        <form onSubmit={handleSubmit} noValidate>
          <input type="hidden" name="plan" value={selectedPlan} />

          <div className="formGroup">
            <input
              name="name"
              type="text"
              placeholder="Full Name *"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? "error" : ""}
              disabled={loading}
            />
            {errors.name && <span className="errorMessage">{errors.name}</span>}
          </div>

          <div className="formGroup">
            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? "error" : ""}
              disabled={loading}
            />
            {errors.email && <span className="errorMessage">{errors.email}</span>}
          </div>

          <div className="formGroup">
            <input
              name="card"
              type="text"
              placeholder="Card Number *"
              value={formatCardNumber(formData.card)}
              onChange={handleInputChange}
              className={errors.card ? "error" : ""}
              disabled={loading}
              maxLength={19}
            />
            {errors.card && <span className="errorMessage">{errors.card}</span>}
          </div>

          <div className="formRow">
            <div className="formGroup">
              <input
                name="expiry"
                type="text"
                placeholder="MM/YY *"
                value={formData.expiry}
                onChange={handleInputChange}
                className={errors.expiry ? "error" : ""}
                disabled={loading}
                maxLength={5}
              />
              {errors.expiry && <span className="errorMessage">{errors.expiry}</span>}
            </div>

            <div className="formGroup">
              <input
                name="cvv"
                type="text"
                placeholder="CVV *"
                value={formData.cvv}
                onChange={handleInputChange}
                className={errors.cvv ? "error" : ""}
                disabled={loading}
                maxLength={3}
              />
              {errors.cvv && <span className="errorMessage">{errors.cvv}</span>}
            </div>
          </div>

          <div className="formGroup">
            <textarea
              name="address"
              placeholder="Billing Address (optional)"
              value={formData.address}
              onChange={handleInputChange}
              disabled={loading}
              rows={2}
            />
          </div>

          <button type="submit" disabled={loading} className={loading ? 'loading' : ''}>
            {loading ? "Processing..." : "Subscribe Now"}
          </button>

          {submitStatus.message && (
            <div className={`statusMessage ${submitStatus.type}`}>
              {submitStatus.message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}