<template>
    <div class="modal" v-if="isOpen">
      <div class="modal-content">
        <p>{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-yes" @click="confirmAction">Ok</button>
          <button v-if="cancel" class="btn btn-no" @click="cancelAction">No</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      message: {
        type: String,
        required: true,
      },
      cancel: {
        type: Boolean,
        required: true,
      }
    },
    data() {
      return {
        isOpen: false,
        resolveCallback: null,
        rejectCallback: null,
      };
    },
    methods: {
      openModal() {
        this.isOpen = true;
        return new Promise((resolve, reject) => {
          this.resolveCallback = resolve;
          this.rejectCallback = reject;
        });
      },
      confirmAction() {
        this.isOpen = false;
        this.resolveCallback();
      },
      cancelAction() {
        this.isOpen = false;
        this.rejectCallback();
      },
    },
  };
  </script>
  
  <style>
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .modal-content {
    background-color: rgb(55, 55, 55);
    padding: 20px;
    border-radius: 20px;
  }
  
  .modal-actions {
    margin-top: 20px;
    text-align: center;
  }
  
  .btn {
    padding: 5px 15px;
    border-radius: 16px;
    cursor: pointer;
  }
  
  .btn-yes {
    background-color: #dbf0e4;
    color: black;
  }
  
  .btn-no {
    background-color: #f5a79e;
    color: black;
    margin-left: 10px;
  }
  </style>
  