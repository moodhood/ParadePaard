package timesheet;

import static io.grpc.MethodDescriptor.generateFullMethodName;

/**
 */
@javax.annotation.Generated(
    value = "by gRPC proto compiler (version 1.68.1)",
    comments = "Source: timesheet_service.proto")
@io.grpc.stub.annotations.GrpcGenerated
public final class TimesheetServiceGrpc {

  private TimesheetServiceGrpc() {}

  public static final java.lang.String SERVICE_NAME = "TimesheetService";

  // Static method descriptors that strictly reflect the proto.
  private static volatile io.grpc.MethodDescriptor<timesheet.TimesheetDataRequest,
      timesheet.TimesheetDataResponse> getRequestTimesheetDataMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "RequestTimesheetData",
      requestType = timesheet.TimesheetDataRequest.class,
      responseType = timesheet.TimesheetDataResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<timesheet.TimesheetDataRequest,
      timesheet.TimesheetDataResponse> getRequestTimesheetDataMethod() {
    io.grpc.MethodDescriptor<timesheet.TimesheetDataRequest, timesheet.TimesheetDataResponse> getRequestTimesheetDataMethod;
    if ((getRequestTimesheetDataMethod = TimesheetServiceGrpc.getRequestTimesheetDataMethod) == null) {
      synchronized (TimesheetServiceGrpc.class) {
        if ((getRequestTimesheetDataMethod = TimesheetServiceGrpc.getRequestTimesheetDataMethod) == null) {
          TimesheetServiceGrpc.getRequestTimesheetDataMethod = getRequestTimesheetDataMethod =
              io.grpc.MethodDescriptor.<timesheet.TimesheetDataRequest, timesheet.TimesheetDataResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "RequestTimesheetData"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  timesheet.TimesheetDataRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  timesheet.TimesheetDataResponse.getDefaultInstance()))
              .setSchemaDescriptor(new TimesheetServiceMethodDescriptorSupplier("RequestTimesheetData"))
              .build();
        }
      }
    }
    return getRequestTimesheetDataMethod;
  }

  private static volatile io.grpc.MethodDescriptor<timesheet.ImportPlannedTimesheetsRequest,
      timesheet.ImportPlannedTimesheetsResponse> getImportPlannedTimesheetsMethod;

  @io.grpc.stub.annotations.RpcMethod(
      fullMethodName = SERVICE_NAME + '/' + "ImportPlannedTimesheets",
      requestType = timesheet.ImportPlannedTimesheetsRequest.class,
      responseType = timesheet.ImportPlannedTimesheetsResponse.class,
      methodType = io.grpc.MethodDescriptor.MethodType.UNARY)
  public static io.grpc.MethodDescriptor<timesheet.ImportPlannedTimesheetsRequest,
      timesheet.ImportPlannedTimesheetsResponse> getImportPlannedTimesheetsMethod() {
    io.grpc.MethodDescriptor<timesheet.ImportPlannedTimesheetsRequest, timesheet.ImportPlannedTimesheetsResponse> getImportPlannedTimesheetsMethod;
    if ((getImportPlannedTimesheetsMethod = TimesheetServiceGrpc.getImportPlannedTimesheetsMethod) == null) {
      synchronized (TimesheetServiceGrpc.class) {
        if ((getImportPlannedTimesheetsMethod = TimesheetServiceGrpc.getImportPlannedTimesheetsMethod) == null) {
          TimesheetServiceGrpc.getImportPlannedTimesheetsMethod = getImportPlannedTimesheetsMethod =
              io.grpc.MethodDescriptor.<timesheet.ImportPlannedTimesheetsRequest, timesheet.ImportPlannedTimesheetsResponse>newBuilder()
              .setType(io.grpc.MethodDescriptor.MethodType.UNARY)
              .setFullMethodName(generateFullMethodName(SERVICE_NAME, "ImportPlannedTimesheets"))
              .setSampledToLocalTracing(true)
              .setRequestMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  timesheet.ImportPlannedTimesheetsRequest.getDefaultInstance()))
              .setResponseMarshaller(io.grpc.protobuf.ProtoUtils.marshaller(
                  timesheet.ImportPlannedTimesheetsResponse.getDefaultInstance()))
              .setSchemaDescriptor(new TimesheetServiceMethodDescriptorSupplier("ImportPlannedTimesheets"))
              .build();
        }
      }
    }
    return getImportPlannedTimesheetsMethod;
  }

  /**
   * Creates a new async stub that supports all call types for the service
   */
  public static TimesheetServiceStub newStub(io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<TimesheetServiceStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<TimesheetServiceStub>() {
        @java.lang.Override
        public TimesheetServiceStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new TimesheetServiceStub(channel, callOptions);
        }
      };
    return TimesheetServiceStub.newStub(factory, channel);
  }

  /**
   * Creates a new blocking-style stub that supports unary and streaming output calls on the service
   */
  public static TimesheetServiceBlockingStub newBlockingStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<TimesheetServiceBlockingStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<TimesheetServiceBlockingStub>() {
        @java.lang.Override
        public TimesheetServiceBlockingStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new TimesheetServiceBlockingStub(channel, callOptions);
        }
      };
    return TimesheetServiceBlockingStub.newStub(factory, channel);
  }

  /**
   * Creates a new ListenableFuture-style stub that supports unary calls on the service
   */
  public static TimesheetServiceFutureStub newFutureStub(
      io.grpc.Channel channel) {
    io.grpc.stub.AbstractStub.StubFactory<TimesheetServiceFutureStub> factory =
      new io.grpc.stub.AbstractStub.StubFactory<TimesheetServiceFutureStub>() {
        @java.lang.Override
        public TimesheetServiceFutureStub newStub(io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
          return new TimesheetServiceFutureStub(channel, callOptions);
        }
      };
    return TimesheetServiceFutureStub.newStub(factory, channel);
  }

  /**
   */
  public interface AsyncService {

    /**
     */
    default void requestTimesheetData(timesheet.TimesheetDataRequest request,
        io.grpc.stub.StreamObserver<timesheet.TimesheetDataResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getRequestTimesheetDataMethod(), responseObserver);
    }

    /**
     */
    default void importPlannedTimesheets(timesheet.ImportPlannedTimesheetsRequest request,
        io.grpc.stub.StreamObserver<timesheet.ImportPlannedTimesheetsResponse> responseObserver) {
      io.grpc.stub.ServerCalls.asyncUnimplementedUnaryCall(getImportPlannedTimesheetsMethod(), responseObserver);
    }
  }

  /**
   * Base class for the server implementation of the service TimesheetService.
   */
  public static abstract class TimesheetServiceImplBase
      implements io.grpc.BindableService, AsyncService {

    @java.lang.Override public final io.grpc.ServerServiceDefinition bindService() {
      return TimesheetServiceGrpc.bindService(this);
    }
  }

  /**
   * A stub to allow clients to do asynchronous rpc calls to service TimesheetService.
   */
  public static final class TimesheetServiceStub
      extends io.grpc.stub.AbstractAsyncStub<TimesheetServiceStub> {
    private TimesheetServiceStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected TimesheetServiceStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new TimesheetServiceStub(channel, callOptions);
    }

    /**
     */
    public void requestTimesheetData(timesheet.TimesheetDataRequest request,
        io.grpc.stub.StreamObserver<timesheet.TimesheetDataResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getRequestTimesheetDataMethod(), getCallOptions()), request, responseObserver);
    }

    /**
     */
    public void importPlannedTimesheets(timesheet.ImportPlannedTimesheetsRequest request,
        io.grpc.stub.StreamObserver<timesheet.ImportPlannedTimesheetsResponse> responseObserver) {
      io.grpc.stub.ClientCalls.asyncUnaryCall(
          getChannel().newCall(getImportPlannedTimesheetsMethod(), getCallOptions()), request, responseObserver);
    }
  }

  /**
   * A stub to allow clients to do synchronous rpc calls to service TimesheetService.
   */
  public static final class TimesheetServiceBlockingStub
      extends io.grpc.stub.AbstractBlockingStub<TimesheetServiceBlockingStub> {
    private TimesheetServiceBlockingStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected TimesheetServiceBlockingStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new TimesheetServiceBlockingStub(channel, callOptions);
    }

    /**
     */
    public timesheet.TimesheetDataResponse requestTimesheetData(timesheet.TimesheetDataRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getRequestTimesheetDataMethod(), getCallOptions(), request);
    }

    /**
     */
    public timesheet.ImportPlannedTimesheetsResponse importPlannedTimesheets(timesheet.ImportPlannedTimesheetsRequest request) {
      return io.grpc.stub.ClientCalls.blockingUnaryCall(
          getChannel(), getImportPlannedTimesheetsMethod(), getCallOptions(), request);
    }
  }

  /**
   * A stub to allow clients to do ListenableFuture-style rpc calls to service TimesheetService.
   */
  public static final class TimesheetServiceFutureStub
      extends io.grpc.stub.AbstractFutureStub<TimesheetServiceFutureStub> {
    private TimesheetServiceFutureStub(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      super(channel, callOptions);
    }

    @java.lang.Override
    protected TimesheetServiceFutureStub build(
        io.grpc.Channel channel, io.grpc.CallOptions callOptions) {
      return new TimesheetServiceFutureStub(channel, callOptions);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<timesheet.TimesheetDataResponse> requestTimesheetData(
        timesheet.TimesheetDataRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getRequestTimesheetDataMethod(), getCallOptions()), request);
    }

    /**
     */
    public com.google.common.util.concurrent.ListenableFuture<timesheet.ImportPlannedTimesheetsResponse> importPlannedTimesheets(
        timesheet.ImportPlannedTimesheetsRequest request) {
      return io.grpc.stub.ClientCalls.futureUnaryCall(
          getChannel().newCall(getImportPlannedTimesheetsMethod(), getCallOptions()), request);
    }
  }

  private static final int METHODID_REQUEST_TIMESHEET_DATA = 0;
  private static final int METHODID_IMPORT_PLANNED_TIMESHEETS = 1;

  private static final class MethodHandlers<Req, Resp> implements
      io.grpc.stub.ServerCalls.UnaryMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ServerStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.ClientStreamingMethod<Req, Resp>,
      io.grpc.stub.ServerCalls.BidiStreamingMethod<Req, Resp> {
    private final AsyncService serviceImpl;
    private final int methodId;

    MethodHandlers(AsyncService serviceImpl, int methodId) {
      this.serviceImpl = serviceImpl;
      this.methodId = methodId;
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public void invoke(Req request, io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        case METHODID_REQUEST_TIMESHEET_DATA:
          serviceImpl.requestTimesheetData((timesheet.TimesheetDataRequest) request,
              (io.grpc.stub.StreamObserver<timesheet.TimesheetDataResponse>) responseObserver);
          break;
        case METHODID_IMPORT_PLANNED_TIMESHEETS:
          serviceImpl.importPlannedTimesheets((timesheet.ImportPlannedTimesheetsRequest) request,
              (io.grpc.stub.StreamObserver<timesheet.ImportPlannedTimesheetsResponse>) responseObserver);
          break;
        default:
          throw new AssertionError();
      }
    }

    @java.lang.Override
    @java.lang.SuppressWarnings("unchecked")
    public io.grpc.stub.StreamObserver<Req> invoke(
        io.grpc.stub.StreamObserver<Resp> responseObserver) {
      switch (methodId) {
        default:
          throw new AssertionError();
      }
    }
  }

  public static final io.grpc.ServerServiceDefinition bindService(AsyncService service) {
    return io.grpc.ServerServiceDefinition.builder(getServiceDescriptor())
        .addMethod(
          getRequestTimesheetDataMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              timesheet.TimesheetDataRequest,
              timesheet.TimesheetDataResponse>(
                service, METHODID_REQUEST_TIMESHEET_DATA)))
        .addMethod(
          getImportPlannedTimesheetsMethod(),
          io.grpc.stub.ServerCalls.asyncUnaryCall(
            new MethodHandlers<
              timesheet.ImportPlannedTimesheetsRequest,
              timesheet.ImportPlannedTimesheetsResponse>(
                service, METHODID_IMPORT_PLANNED_TIMESHEETS)))
        .build();
  }

  private static abstract class TimesheetServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoFileDescriptorSupplier, io.grpc.protobuf.ProtoServiceDescriptorSupplier {
    TimesheetServiceBaseDescriptorSupplier() {}

    @java.lang.Override
    public com.google.protobuf.Descriptors.FileDescriptor getFileDescriptor() {
      return timesheet.TimesheetServiceOuterClass.getDescriptor();
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.ServiceDescriptor getServiceDescriptor() {
      return getFileDescriptor().findServiceByName("TimesheetService");
    }
  }

  private static final class TimesheetServiceFileDescriptorSupplier
      extends TimesheetServiceBaseDescriptorSupplier {
    TimesheetServiceFileDescriptorSupplier() {}
  }

  private static final class TimesheetServiceMethodDescriptorSupplier
      extends TimesheetServiceBaseDescriptorSupplier
      implements io.grpc.protobuf.ProtoMethodDescriptorSupplier {
    private final java.lang.String methodName;

    TimesheetServiceMethodDescriptorSupplier(java.lang.String methodName) {
      this.methodName = methodName;
    }

    @java.lang.Override
    public com.google.protobuf.Descriptors.MethodDescriptor getMethodDescriptor() {
      return getServiceDescriptor().findMethodByName(methodName);
    }
  }

  private static volatile io.grpc.ServiceDescriptor serviceDescriptor;

  public static io.grpc.ServiceDescriptor getServiceDescriptor() {
    io.grpc.ServiceDescriptor result = serviceDescriptor;
    if (result == null) {
      synchronized (TimesheetServiceGrpc.class) {
        result = serviceDescriptor;
        if (result == null) {
          serviceDescriptor = result = io.grpc.ServiceDescriptor.newBuilder(SERVICE_NAME)
              .setSchemaDescriptor(new TimesheetServiceFileDescriptorSupplier())
              .addMethod(getRequestTimesheetDataMethod())
              .addMethod(getImportPlannedTimesheetsMethod())
              .build();
        }
      }
    }
    return result;
  }
}
